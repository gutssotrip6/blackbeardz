// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TrackingEventData } from '@/types/tracking';

const WC_API_URL = `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wc/v3`;
const WC_CONSUMER_KEY = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY || '';
const WC_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET || '';

/**
 * Sends server-side tracking events to Meta and TikTok
 */
async function sendServerTrackingEvents(
  orderData: any,
  createdOrder: any
): Promise<void> {
  const eventId = createdOrder.id.toString(); // Use order ID as event ID for deduplication
  const eventTime = Math.floor(Date.now() / 1000);

  // Prepare tracking payload
  const trackingPayload: TrackingEventData = {
    event_id: eventId,
    event_name: 'Purchase',
    event_time: eventTime,
    event_source_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://blackbeardz.com',
    user_data: {
      email: orderData.billing?.email,
      phone: orderData.billing?.phone,
      first_name: orderData.billing?.first_name,
      last_name: orderData.billing?.last_name,
      city: orderData.billing?.city,
      state: orderData.billing?.state,
      country: orderData.billing?.country
    },
    custom_data: {
      value: parseFloat(createdOrder.total),
      currency: 'DZD',
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

  // Send to Meta Conversions API
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/tracking/meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackingPayload)
    });
  } catch (error) {
    console.error('Failed to send Meta server-side tracking:', error);
  }

  // Send to TikTok Events API
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/tracking/tiktok`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackingPayload)
    });
  } catch (error) {
    console.error('Failed to send TikTok server-side tracking:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // FIXED: Validate billing instead of customer (since we moved it to root level)
    if (!orderData.billing || !orderData.line_items || orderData.line_items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required order data' },
        { status: 400 }
      );
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
    await sendServerTrackingEvents(orderData, createdOrder);

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
