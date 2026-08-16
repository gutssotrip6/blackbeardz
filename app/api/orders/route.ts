// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TrackingEventData } from '@/types/tracking';
import { getProductsByIds } from '@/lib/woocommerce';
import { repriceLineItems } from '@/lib/order-pricing';

// Orders must always be priced against live WooCommerce data, never a cached
// snapshot of the catalog.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const WC_API_URL = `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wc/v3`;
const WC_CONSUMER_KEY = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY || '';
const WC_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET || '';

/**
 * Attribution context handed over by the browser with the order.
 *
 * These identifiers (ad click ids, first-party cookies) only exist client-side,
 * so a purely server-side conversion event would lose them — and with them, the
 * link between the order and the ad that produced it.
 */
interface ClientTrackingContext {
  ttclid?: string;
  ttp?: string;
  fbp?: string;
  fbc?: string;
  event_source_url?: string;
  referrer?: string;
}

/**
 * Sends server-side tracking events to Meta and TikTok
 */
async function sendServerTrackingEvents(
  orderData: any,
  createdOrder: any,
  request: NextRequest,
  tracking?: ClientTrackingContext
): Promise<void> {
  const eventId = createdOrder.id.toString(); // Use order ID as event ID for deduplication
  const eventTime = Math.floor(Date.now() / 1000);

  // Prepare tracking payload
  const trackingPayload: TrackingEventData = {
    event_id: eventId,
    event_name: 'Purchase',
    event_time: eventTime,
    event_source_url: tracking?.event_source_url || process.env.NEXT_PUBLIC_SITE_URL,
    referrer: tracking?.referrer,
    // Meta attribution cookies.
    fbp: tracking?.fbp,
    fbc: tracking?.fbc,
    // TikTok attribution: the click id is what ties this order back to the ad.
    // It only exists in the browser, so the checkout hands it over with the order.
    ttclid: tracking?.ttclid,
    ttp: tracking?.ttp,
    user_data: {
      email: orderData.billing?.email,
      phone: orderData.billing?.phone,
      // The order id is a stable, non-PII identifier TikTok can match on.
      external_id: eventId,
      first_name: orderData.billing?.first_name,
      last_name: orderData.billing?.last_name,
      city: orderData.billing?.city,
      state: orderData.billing?.state,
      country: orderData.billing?.country
    },
    custom_data: {
      value: parseFloat(createdOrder.total),
      currency: 'DZD',
      order_id: eventId,
      content_ids: orderData.line_items?.map((item: any) => String(item.product_id)),
      content_type: 'product',
      contents: orderData.line_items?.map((item: any) => ({
        id: String(item.product_id),
        quantity: item.quantity,
        item_price: parseFloat(item.price || item.total),
        title: item.name || `Product ${item.product_id}`,
        category: 'product'
      })),
      num_items: orderData.line_items?.reduce((sum: number, item: any) => sum + item.quantity, 0)
    }
  };

  // Forward the shopper's IP and user agent. Without this the tracking routes
  // would see THIS server as the client (these are server-to-server calls),
  // which wrecks match quality on both platforms.
  const forwardedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const clientIp =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip');
  if (clientIp) forwardedHeaders['x-forwarded-for'] = clientIp;
  const userAgent = request.headers.get('user-agent');
  if (userAgent) forwardedHeaders['user-agent'] = userAgent;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  // Send to Meta Conversions API
  try {
    await fetch(`${baseUrl}/api/tracking/meta`, {
      method: 'POST',
      headers: forwardedHeaders,
      body: JSON.stringify(trackingPayload)
    });
  } catch (error) {
    console.error('Failed to send Meta server-side tracking:', error);
  }

  // Send to TikTok Events API. The event name is translated to CompletePayment
  // by the TikTok route — TikTok has no Purchase event.
  try {
    await fetch(`${baseUrl}/api/tracking/tiktok`, {
      method: 'POST',
      headers: forwardedHeaders,
      body: JSON.stringify(trackingPayload)
    });
  } catch (error) {
    console.error('Failed to send TikTok server-side tracking:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // `_tracking` is our own field, not WooCommerce's — pull it off before the
    // rest of the body is forwarded to the store.
    const { _tracking: clientTracking, ...orderData } = await request.json();

    // FIXED: Validate billing instead of customer (since we moved it to root level)
    if (!orderData.billing || !orderData.line_items || orderData.line_items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required order data' },
        { status: 400 }
      );
    }

    // Authoritative pricing: recompute every line item from live WooCommerce
    // data and ignore whatever the browser claimed the price was.
    const { lineItems, warning } = await repriceLineItems(orderData.line_items, getProductsByIds);
    orderData.line_items = lineItems;

    if (warning) {
      console.warn('Order repricing warning:', warning);
      orderData.customer_note = [orderData.customer_note, `⚠️ ${warning}`]
        .filter(Boolean)
        .join('\n');
    }

    // Build WooCommerce API URL with authentication
    const apiUrl = new URL(`${WC_API_URL}/orders`);
    apiUrl.searchParams.append('consumer_key', WC_CONSUMER_KEY);
    apiUrl.searchParams.append('consumer_secret', WC_CONSUMER_SECRET);

    console.log('Sending order to WooCommerce...');

    // Send order to WooCommerce
    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WooCommerce error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || `HTTP ${response.status}` };
      }
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || `WooCommerce error: ${response.status}`,
          code: errorData.code 
        },
        { status: response.status }
      );
    }

    const createdOrder = await response.json();
    console.log('Order created successfully:', createdOrder.id);

    // Send server-side tracking events (Meta Conversions API & TikTok Events API)
    await sendServerTrackingEvents(orderData, createdOrder, request, clientTracking);

    return NextResponse.json({
      success: true,
      order: {
        id: createdOrder.id,
        number: createdOrder.number,
        status: createdOrder.status,
        total: createdOrder.total,
        date_created: createdOrder.date_created,
      },
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
