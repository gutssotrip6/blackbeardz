// app/api/tracking/meta/route.ts
// Server-side Meta Conversions API implementation

import { NextRequest, NextResponse } from 'next/server';
import { TrackingEventData, ServerTrackingResponse } from '@/types/tracking';

const META_CONVERSIONS_API_URL = 'https://graph.facebook.com/v19.0/{pixel_id}/events';

interface MetaEvent {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url?: string;
  user_data?: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_ids?: string[];
    content_name?: string;
    content_type?: string;
    contents?: Array<{
      id: string;
      quantity: number;
      item_price: number;
    }>;
    num_items?: number;
  };
  action_source: string;
}

/**
 * Hashes a string using SHA-256 for Meta Conversions API
 * Meta requires normalized and hashed user data
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
 * Sends event to Meta Conversions API with retry logic
 */
async function sendToMetaAPI(
  pixelId: string,
  accessToken: string,
  events: MetaEvent[],
  testEventCode?: string
): Promise<any> {
  const url = META_CONVERSIONS_API_URL.replace('{pixel_id}', pixelId);
  
  const payload = {
    data: events,
    access_token: accessToken,
    ...(testEventCode && { test_event_code: testEventCode })
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
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const error = responseData.error || { message: 'Unknown error' };
        console.error(`Meta API attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error(`Meta API attempt ${attempt} error:`, error);
      
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
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;
    const testEventCode = process.env.META_TEST_EVENT_CODE;

    if (!pixelId || !accessToken) {
      console.error('Meta Conversions API credentials not configured');
      return NextResponse.json(
        { success: false, message: 'Meta credentials not configured' },
        { status: 500 }
      );
    }

    // Prepare user data with hashing (required by Meta)
    const userData: any = {};
    if (body.user_data) {
      if (body.user_data.email) {
        userData.em = await hashData(normalizeEmail(body.user_data.email));
      }
      if (body.user_data.phone) {
        userData.ph = await hashData(normalizePhone(body.user_data.phone));
      }
      if (body.user_data.first_name) {
        userData.fn = await hashData(body.user_data.first_name.toLowerCase().trim());
      }
      if (body.user_data.last_name) {
        userData.ln = await hashData(body.user_data.last_name.toLowerCase().trim());
      }
      if (body.user_data.city) {
        userData.ct = await hashData(body.user_data.city.toLowerCase().trim());
      }
      if (body.user_data.state) {
        userData.st = await hashData(body.user_data.state.toLowerCase().trim());
      }
      if (body.user_data.country) {
        userData.country = await hashData(body.user_data.country.toLowerCase().trim());
      }
    }

    // Prepare custom data
    const customData: any = {};
    if (body.custom_data) {
      if (body.custom_data.value !== undefined) customData.value = body.custom_data.value;
      if (body.custom_data.currency) customData.currency = body.custom_data.currency;
      if (body.custom_data.content_ids) customData.content_ids = body.custom_data.content_ids;
      if (body.custom_data.content_name) customData.content_name = body.custom_data.content_name;
      if (body.custom_data.content_type) customData.content_type = body.custom_data.content_type;
      if (body.custom_data.contents) {
        customData.contents = body.custom_data.contents.map(c => ({
          id: String(c.id),
          quantity: c.quantity,
          item_price: c.item_price
        }));
      }
      if (body.custom_data.num_items !== undefined) customData.num_items = body.custom_data.num_items;
    }

    // Build Meta event
    const metaEvent: MetaEvent = {
      event_name: body.event_name,
      event_time: body.event_time || Math.floor(Date.now() / 1000),
      event_id: body.event_id,
      event_source_url: body.event_source_url,
      user_data: Object.keys(userData).length > 0 ? userData : undefined,
      custom_data: Object.keys(customData).length > 0 ? customData : undefined,
      action_source: 'website'
    };

    // Send to Meta API
    const result = await sendToMetaAPI(pixelId, accessToken, [metaEvent], testEventCode);

    console.log('Meta Conversions API event sent successfully:', body.event_name, body.event_id);

    const response: ServerTrackingResponse = {
      success: true,
      eventId: body.event_id,
      platform: 'meta'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Meta Conversions API error:', error);
    const response: ServerTrackingResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
