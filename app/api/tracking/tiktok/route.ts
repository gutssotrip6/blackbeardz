// app/api/tracking/tiktok/route.ts
// Server-side TikTok Events API 2.0 implementation.
//
// The browser pixel is routinely blocked by ad blockers, ITP and network
// filters. This route is the copy of every event that cannot be blocked: it is
// called from our own origin and forwards to TikTok server-to-server. Browser
// and server events share an event_id, so TikTok de-duplicates them.
//
// Endpoint is v1.3 `event/track/` — the old v1.2 `pixel/events/` endpoint is
// deprecated and takes a different payload shape.

import { NextRequest, NextResponse } from 'next/server';
import {
  TrackingEventData,
  ServerTrackingResponse,
  TrackingContentItem,
  TikTokContentItem,
} from '@/types/tracking';
import {
  TIKTOK_EVENTS_API_URL,
  TIKTOK_PIXEL_ID,
  toTikTokEventName,
} from '@/config/tracking';

export const dynamic = 'force-dynamic';

interface TikTokEventPayload {
  event: string;
  event_time: number;
  event_id: string;
  user: Record<string, unknown>;
  properties?: Record<string, unknown>;
  page?: { url?: string; referrer?: string };
}

/**
 * SHA-256 hex, as required for every piece of personal data TikTok receives.
 * Values must be normalized (trimmed/lowercased) BEFORE hashing or the hash
 * won't match TikTok's — which silently costs match quality.
 */
async function hashData(value: string): Promise<string> {
  if (!value) return '';
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** TikTok expects E.164. Algerian locals (0XXXXXXXXX) become +213XXXXXXXXX. */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('213')) return `+${digits}`;
  if (digits.startsWith('0')) return `+213${digits.slice(1)}`;
  return `+${digits}`;
}

function normalizeLower(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Best-effort client IP.
 *
 * The request reaching this route comes from the shopper's browser, but behind
 * a proxy/CDN the socket address is the proxy's — the original is in the
 * forwarding headers. TikTok uses IP + user agent for matching, so an empty or
 * wrong value measurably lowers attribution.
 */
function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    undefined
  );
}

/**
 * Normalizes the two content shapes that reach this route into TikTok's.
 *
 * The TikTok pixel sends TikTok-shaped items ({content_id, price}); the order
 * route sends Meta-shaped ones ({id, item_price}). Both must work.
 */
function normalizeContents(
  contents: (TrackingContentItem | TikTokContentItem)[] | undefined
): Array<Record<string, unknown>> | undefined {
  if (!contents || contents.length === 0) return undefined;

  return contents.map(item => {
    const tiktokItem = item as TikTokContentItem;
    const metaItem = item as TrackingContentItem;

    return {
      content_id: String(tiktokItem.content_id ?? metaItem.id ?? ''),
      content_type: tiktokItem.content_type || 'product',
      ...(tiktokItem.content_name || metaItem.title
        ? { content_name: tiktokItem.content_name || metaItem.title }
        : {}),
      ...(tiktokItem.content_category || metaItem.category
        ? { content_category: tiktokItem.content_category || metaItem.category }
        : {}),
      quantity: item.quantity ?? 1,
      price: tiktokItem.price ?? metaItem.item_price ?? 0,
    };
  });
}

/**
 * Posts to TikTok with exponential backoff.
 *
 * TikTok answers HTTP 200 with a non-zero `code` on business errors, so the
 * status alone doesn't tell you whether the event landed — the body must be
 * checked too, otherwise silently rejected events look like successes.
 */
async function sendToTikTokAPI(
  pixelId: string,
  accessToken: string,
  events: TikTokEventPayload[],
  testEventCode?: string
): Promise<any> {
  const payload = {
    event_source: 'web',
    event_source_id: pixelId,
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
    data: events,
  };

  const maxRetries = 3;
  const baseDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(TIKTOK_EVENTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': accessToken,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));
      const isBusinessError = responseData?.code !== undefined && responseData.code !== 0;

      if (!response.ok || isBusinessError) {
        const message =
          responseData?.message || responseData?.error || `HTTP ${response.status}`;
        console.error(`TikTok API attempt ${attempt} failed:`, message, responseData);

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt - 1)));
          continue;
        }
        throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
      }

      return responseData;
    } catch (error) {
      console.error(`TikTok API attempt ${attempt} error:`, error);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt - 1)));
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

    if (!body.event_id || !body.event_name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: event_id and event_name' },
        { status: 400 }
      );
    }

    // Pixel id falls back to the committed config so the server side works even
    // when the env var never reaches the process; the access token cannot.
    const pixelId = process.env.TIKTOK_PIXEL_ID || TIKTOK_PIXEL_ID;
    const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
    const testEventCode = process.env.TIKTOK_TEST_EVENT_CODE;

    if (!accessToken) {
      // Not an error the shopper should ever feel — the browser pixel still
      // fired. Report it plainly so a missing token is visible in logs.
      console.warn(
        'TIKTOK_ACCESS_TOKEN not configured — server-side Events API disabled, browser pixel only'
      );
      return NextResponse.json(
        { success: false, message: 'TikTok access token not configured', platform: 'tiktok' },
        { status: 200 }
      );
    }

    // --- user block: everything TikTok matches on ---------------------------
    const user: Record<string, unknown> = {};

    if (body.user_data?.email) {
      user.email = await hashData(normalizeLower(body.user_data.email));
    }
    if (body.user_data?.phone) {
      user.phone = await hashData(normalizePhone(body.user_data.phone));
    }
    if (body.user_data?.external_id) {
      user.external_id = await hashData(normalizeLower(body.user_data.external_id));
    }
    if (body.user_data?.first_name) {
      user.first_name = await hashData(normalizeLower(body.user_data.first_name));
    }
    if (body.user_data?.last_name) {
      user.last_name = await hashData(normalizeLower(body.user_data.last_name));
    }
    if (body.user_data?.city) user.city = await hashData(normalizeLower(body.user_data.city));
    if (body.user_data?.state) user.state = await hashData(normalizeLower(body.user_data.state));
    if (body.user_data?.country) {
      user.country = await hashData(normalizeLower(body.user_data.country));
    }
    if (body.user_data?.zip_code) {
      user.zip_code = await hashData(normalizeLower(body.user_data.zip_code));
    }

    // Attribution identifiers are sent RAW — hashing them breaks the match.
    if (body.ttclid) user.ttclid = body.ttclid;
    if (body.ttp) user.ttp = body.ttp;

    const clientIp = getClientIp(request);
    if (clientIp) user.ip = clientIp;
    const userAgent = request.headers.get('user-agent');
    if (userAgent) user.user_agent = userAgent;

    // --- properties block ---------------------------------------------------
    const properties: Record<string, unknown> = {};
    if (body.custom_data) {
      const { custom_data } = body;

      if (custom_data.value !== undefined) properties.value = custom_data.value;
      if (custom_data.currency) properties.currency = custom_data.currency;
      if (custom_data.content_type) properties.content_type = custom_data.content_type;
      if (custom_data.content_name) properties.content_name = custom_data.content_name;
      if (custom_data.content_category) properties.content_category = custom_data.content_category;
      if (custom_data.order_id) properties.order_id = custom_data.order_id;

      const contentId =
        custom_data.content_id ||
        (custom_data.content_ids && custom_data.content_ids[0]) ||
        undefined;
      if (contentId) properties.content_id = String(contentId);

      const contents = normalizeContents(custom_data.contents);
      if (contents) {
        properties.contents = contents;
        if (!properties.content_type) properties.content_type = 'product';
      }

      const quantity = custom_data.quantity ?? custom_data.num_items;
      if (quantity !== undefined) properties.quantity = quantity;
    }

    const tiktokEvent: TikTokEventPayload = {
      // Translate here too: the order route posts Meta-flavoured names, and
      // TikTok has no Purchase event.
      event: toTikTokEventName(body.event_name),
      event_time: body.event_time || Math.floor(Date.now() / 1000),
      event_id: body.event_id,
      user,
      ...(Object.keys(properties).length > 0 && { properties }),
      ...((body.event_source_url || body.referrer) && {
        page: {
          ...(body.event_source_url && { url: body.event_source_url }),
          ...(body.referrer && { referrer: body.referrer }),
        },
      }),
    };

    await sendToTikTokAPI(pixelId, accessToken, [tiktokEvent], testEventCode);

    console.log('TikTok Events API event sent:', tiktokEvent.event, body.event_id);

    const response: ServerTrackingResponse = {
      success: true,
      eventId: body.event_id,
      platform: 'tiktok',
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('TikTok Events API error:', error);
    const response: ServerTrackingResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      platform: 'tiktok',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
