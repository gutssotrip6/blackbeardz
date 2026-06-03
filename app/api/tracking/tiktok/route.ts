// app/api/tracking/tiktok/route.ts
// Server-side TikTok Events API implementation

import { NextRequest, NextResponse } from 'next/server';
import { TrackingEventData, ServerTrackingResponse } from '@/types/tracking';

const TIKTOK_EVENTS_API_URL = 'https://business-api.tiktok.com/open_api/v1.2/pixel/events/';

interface TikTokEvent {
  event: string;
  event_time: number;
  event_id: string;
  context?: {
    ad?: {
      callback: string;
    };
    page?: {
      url: string;
    };
    user?: {
      external_id?: string;
      phone?: string;
      email?: string;
      tt_identifiers?: Array<{
        identifier: string;
        value: string;
      }>;
    };
  };
  properties?: {
    value?: number;
    currency?: string;
    content_id?: string;
    content_name?: string;
    content_type?: string;
    contents?: Array<{
      content_id: string;
      quantity: number;
      price: number;
    }>;
    quantity?: number;
  };
}

/**
 * Hashes a string using SHA-256 for TikTok Events API
 * TikTok requires normalized and hashed user data
 */
async function hashData(data: string): Promise<string> {
  if (!data) return '';
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalizes phone number for hashing
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').trim();
}

/**
 * Normalizes email for hashing
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sends event to TikTok Events API with retry logic
 */
async function sendToTikTokAPI(
  pixelId: string,
  accessToken: string,
  events: TikTokEvent[],
  testEventCode?: string
): Promise<any> {
  const url = TIKTOK_EVENTS_API_URL;
  
  const payload = {
    pixel_id: pixelId,
    events: events,
    test_event_code: testEventCode || undefined,
    timestamp: Math.floor(Date.now() / 1000)
  };

  // Retry logic with exponential backoff
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': accessToken,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const error = responseData.message || responseData.error || { message: 'Unknown error' };
        console.error(`TikTok API attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
      }

      return responseData;
    } catch (error) {
      console.error(`TikTok API attempt ${attempt} error:`, error);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackingEventData = await request.json();

    // Validate required fields
    if (!body.event_id || !body.event_name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: event_id and event_name' },
        { status: 400 }
      );
    }

    // Get credentials from environment variables
    const pixelId = process.env.TIKTOK_PIXEL_ID;
    const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
    const testEventCode = process.env.TIKTOK_TEST_EVENT_CODE;

    if (!pixelId || !accessToken) {
      console.error('TikTok Events API credentials not configured');
      return NextResponse.json(
        { success: false, message: 'TikTok credentials not configured' },
        { status: 500 }
      );
    }

    // Prepare user data with hashing (required by TikTok)
    const userContext: any = {};
    if (body.user_data) {
      const ttIdentifiers: Array<{ identifier: string; value: string }> = [];
      
      if (body.user_data.email) {
        ttIdentifiers.push({
          identifier: 'email',
          value: await hashData(normalizeEmail(body.user_data.email))
        });
      }
      if (body.user_data.phone) {
        ttIdentifiers.push({
          identifier: 'phone',
          value: await hashData(normalizePhone(body.user_data.phone))
        });
      }
      
      if (ttIdentifiers.length > 0) {
        userContext.tt_identifiers = ttIdentifiers;
      }
    }

    // Prepare properties (custom data)
    const properties: any = {};
    if (body.custom_data) {
      if (body.custom_data.value !== undefined) properties.value = body.custom_data.value;
      if (body.custom_data.currency) properties.currency = body.custom_data.currency;
      if (body.custom_data.content_ids && body.custom_data.content_ids.length > 0) {
        properties.content_id = body.custom_data.content_ids[0];
      }
      if (body.custom_data.content_name) properties.content_name = body.custom_data.content_name;
      if (body.custom_data.content_type) properties.content_type = body.custom_data.content_type;
      if (body.custom_data.contents) {
        properties.contents = body.custom_data.contents.map(c => ({
          content_id: String(c.id),
          quantity: c.quantity,
          price: c.item_price
        }));
      }
      if (body.custom_data.num_items !== undefined) properties.quantity = body.custom_data.num_items;
    }

    // Build TikTok event
    const tiktokEvent: TikTokEvent = {
      event: body.event_name,
      event_time: body.event_time || Math.floor(Date.now() / 1000),
      event_id: body.event_id,
      context: {
        page: {
          url: body.event_source_url || 'https://blackbeardz.com'
        },
        ...(Object.keys(userContext).length > 0 && { user: userContext })
      },
      ...(Object.keys(properties).length > 0 && { properties })
    };

    // Send to TikTok API
    const result = await sendToTikTokAPI(pixelId, accessToken, [tiktokEvent], testEventCode);

    console.log('TikTok Events API event sent successfully:', body.event_name, body.event_id);

    const response: ServerTrackingResponse = {
      success: true,
      eventId: body.event_id,
      platform: 'tiktok'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('TikTok Events API error:', error);
    const response: ServerTrackingResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
