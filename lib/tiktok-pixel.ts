// lib/tiktok-pixel.ts
// TikTok Pixel browser-side tracking + Events API mirroring.
//
// Mirrors the hardening already applied to the Meta pixel:
//   1. The pixel is loaded by a canonical inline <head> snippet in
//      app/layout.tsx so it fires before React hydration.
//   2. init() here is a safety net that loads it from a <meta> tag if that
//      snippet was blocked, stripped, or never executed.
//   3. Every event is sent twice — browser pixel AND server-side Events API —
//      carrying the same event_id so TikTok de-duplicates them into one event.
//      The browser call can be blocked by an ad blocker; the server call is
//      made from our own origin and cannot be.

import { TrackingContentItem } from '@/types/tracking';
import { generateEventId, markEventProcessed } from './tracking-utils';
import { TIKTOK_PIXEL_ID, TIKTOK_PIXEL_META_TAG, TIKTOK_EVENTS, toTikTokEventName } from '@/config/tracking';

declare global {
  interface Window {
    ttq?: any;
    TiktokAnalyticsObject?: string;
  }
}

/** localStorage key used to remember the click id across the session. */
const TTCLID_STORAGE_KEY = 'blackbear-ttclid';

/** Read a browser cookie by name (used for TikTok's _ttp). */
function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
  const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * TikTok's click id.
 *
 * It arrives once, as a `?ttclid=` query param on the ad click, and is the
 * single strongest attribution signal there is — without it a conversion can't
 * be tied back to the ad that produced it. The shopper will navigate away from
 * that landing URL long before they order, so it is persisted on first sight
 * and read back at conversion time.
 */
function getTtclid(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const fromUrl = new URLSearchParams(window.location.search).get('ttclid');
    if (fromUrl) {
      window.localStorage.setItem(TTCLID_STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    return window.localStorage.getItem(TTCLID_STORAGE_KEY) || undefined;
  } catch {
    // Private mode / storage disabled — fall back to the URL only.
    try {
      return new URLSearchParams(window.location.search).get('ttclid') || undefined;
    } catch {
      return undefined;
    }
  }
}

/** TikTok's first-party cookie, set by the pixel once it loads. */
function getTtp(): string | undefined {
  return readCookie('_ttp');
}

/** Attribution identifiers to attach to every server-side event. */
export function getTikTokAttribution(): { ttclid?: string; ttp?: string } {
  return { ttclid: getTtclid(), ttp: getTtp() };
}

export interface TikTokUserData {
  email?: string;
  phone?: string;
  external_id?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

class TikTokPixel {
  /** Advanced-matching data, remembered so later events inherit it. */
  private userData: TikTokUserData = {};

  /**
   * Fallback initializer. The pixel is normally loaded + inited + page()'d by
   * the canonical inline snippet in app/layout.tsx <head>. This runs from
   * TrackingProvider as a safety net: if window.ttq is missing (inline script
   * blocked, stripped, or didn't execute) we load the pixel ourselves. The id
   * is read from the server-rendered <meta> tag first, so it works even when
   * NEXT_PUBLIC_TIKTOK_PIXEL_ID wasn't inlined into the client bundle.
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Capture the click id as early as possible, before any navigation drops it.
    getTtclid();

    if (window.ttq) return; // already set up by the <head> snippet

    const id =
      document.querySelector(`meta[name="${TIKTOK_PIXEL_META_TAG}"]`)?.getAttribute('content') ||
      TIKTOK_PIXEL_ID;

    if (!id || id === 'missing') {
      console.warn('[tiktok-pixel] no pixel id found — cannot init');
      return;
    }

    (function (w: any, d: Document, t: string) {
      w.TiktokAnalyticsObject = t;
      const ttq: any = (w[t] = w[t] || []);
      ttq.methods = [
        'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once',
        'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent',
        'revokeConsent', 'grantConsent',
      ];
      ttq.setAndDefer = function (obj: any, method: string) {
        obj[method] = function () {
          obj.push([method].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (id: string) {
        const inst = ttq._i[id] || [];
        for (let n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(inst, ttq.methods[n]);
        return inst;
      };
      ttq.load = function (e: string, n?: any) {
        const url = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = url;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        const script = d.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = `${url}?sdkid=${e}&lib=${t}`;
        const first = d.getElementsByTagName('script')[0];
        first.parentNode?.insertBefore(script, first);
      };
      ttq.load(id);
      ttq.page();
    })(window, document, 'ttq');

    console.info('[tiktok-pixel] fallback init + page', id);
  }

  /**
   * Attaches advanced-matching data to the pixel.
   *
   * TikTok hashes these with SHA-256 in the browser before they leave the page;
   * the server side hashes them itself. Better match quality directly raises
   * how many conversions TikTok can attribute.
   */
  identify(userData: TikTokUserData): void {
    this.userData = { ...this.userData, ...userData };

    if (typeof window === 'undefined' || !window.ttq) return;
    try {
      window.ttq.identify({
        ...(userData.email && { email: userData.email.trim().toLowerCase() }),
        ...(userData.phone && { phone_number: normalizePhoneE164(userData.phone) }),
        ...(userData.external_id && { external_id: userData.external_id }),
        ...(userData.first_name && { first_name: userData.first_name.trim().toLowerCase() }),
        ...(userData.last_name && { last_name: userData.last_name.trim().toLowerCase() }),
        ...(userData.city && { city: userData.city.trim().toLowerCase() }),
        ...(userData.state && { state: userData.state.trim().toLowerCase() }),
        ...(userData.country && { country: userData.country.trim().toLowerCase() }),
        ...(userData.zip_code && { zip_code: userData.zip_code.trim() }),
      });
    } catch (error) {
      console.error('[tiktok-pixel] identify failed:', error);
    }
  }

  /**
   * Mirror an event to the server-side Events API.
   *
   * This is what makes every event actually get recorded: the browser pixel is
   * routinely blocked by ad blockers, ITP and network filters, but a request to
   * our own /api route is not. Both carry the same event_id, so TikTok collapses
   * them into a single event rather than double-counting.
   */
  private sendServerEvent(eventName: string, eventId: string, properties?: any): void {
    if (typeof window === 'undefined') return;
    try {
      const { ttclid, ttp } = getTikTokAttribution();
      const payload = {
        event_id: eventId,
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: window.location.href,
        referrer: document.referrer || undefined,
        ttclid,
        ttp,
        user_data: Object.keys(this.userData).length > 0 ? this.userData : undefined,
        custom_data: properties,
      };
      // keepalive lets the request complete even if the shopper navigates away
      // — essential for CompletePayment and InitiateCheckout.
      fetch('/api/tracking/tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify(payload),
      }).catch(() => {/* tracking must never break the UI */});
    } catch {
      /* swallow — tracking must never throw */
    }
  }

  /**
   * Track an event: browser pixel + server Events API, one shared event_id.
   * `eventName` may be given in the app's internal (Meta-flavoured) vocabulary;
   * it is translated to TikTok's before being sent.
   */
  track(eventName: string, properties?: any, eventId?: string): void {
    if (typeof window === 'undefined') return;

    const tiktokEvent = toTikTokEventName(eventName);
    const finalEventId = eventId || generateEventId();

    markEventProcessed(finalEventId);

    // 1) Browser pixel (best-effort — may be blocked)
    if (window.ttq) {
      try {
        window.ttq.track(tiktokEvent, properties || {}, { event_id: finalEventId });
      } catch (error) {
        console.error('[tiktok-pixel] browser track failed:', error);
      }
    } else {
      console.warn('[tiktok-pixel] window.ttq not ready (browser pixel skipped)');
    }

    // 2) Server-side Events API (always fires, can't be blocked)
    this.sendServerEvent(tiktokEvent, finalEventId, properties);

    console.info('[tiktok-pixel] track', tiktokEvent, { eventId: finalEventId });
  }

  /**
   * Track PageView.
   *
   * The browser pixel records page views through ttq.page(), not ttq.track() —
   * "Pageview" is only an Events API event name.
   */
  pageView(eventId?: string): void {
    if (typeof window === 'undefined') return;

    const finalEventId = eventId || generateEventId();
    markEventProcessed(finalEventId);

    if (window.ttq) {
      try {
        window.ttq.page();
      } catch (error) {
        console.error('[tiktok-pixel] browser page() failed:', error);
      }
    }

    this.sendServerEvent(TIKTOK_EVENTS.pageView, finalEventId);
    console.info('[tiktok-pixel] pageView', { eventId: finalEventId });
  }

  /** Builds the `properties` block shared by every commerce event. */
  private commerceProperties(
    contents: TrackingContentItem[],
    value: number,
    currency: string
  ) {
    return {
      contents: contents.map(item => ({
        content_id: String(item.id),
        content_type: 'product',
        content_name: item.title,
        content_category: item.category,
        quantity: item.quantity,
        price: item.item_price,
      })),
      content_type: 'product',
      // TikTok reads content_id at the top level for single-item events.
      content_id: contents[0] ? String(contents[0].id) : undefined,
      value,
      currency,
      quantity: contents.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  /** Track ViewContent (product page view). */
  viewContent(
    contentId: string,
    contentName: string,
    value: number,
    currency: string = 'DZD',
    eventId?: string
  ): void {
    this.track(
      TIKTOK_EVENTS.viewContent,
      {
        contents: [{ content_id: contentId, content_type: 'product', content_name: contentName, quantity: 1, price: value }],
        content_id: contentId,
        content_name: contentName,
        content_type: 'product',
        value,
        currency,
      },
      eventId
    );
  }

  /** Track AddToCart. */
  addToCart(contents: TrackingContentItem[], value: number, currency: string = 'DZD', eventId?: string): void {
    this.track(TIKTOK_EVENTS.addToCart, this.commerceProperties(contents, value, currency), eventId);
  }

  /** Track InitiateCheckout. */
  initiateCheckout(contents: TrackingContentItem[], value: number, currency: string = 'DZD', eventId?: string): void {
    this.track(TIKTOK_EVENTS.initiateCheckout, this.commerceProperties(contents, value, currency), eventId);
  }

  /**
   * Track PlaceAnOrder — the order was submitted.
   *
   * Meaningful for a cash-on-delivery store, where an order is placed long
   * before any payment is collected. Reported separately from CompletePayment,
   * so it does not double-count purchase value.
   */
  placeAnOrder(contents: TrackingContentItem[], value: number, currency: string = 'DZD', eventId?: string): void {
    this.track(TIKTOK_EVENTS.placeAnOrder, this.commerceProperties(contents, value, currency), eventId);
  }

  /**
   * Track CompletePayment — TikTok's purchase event.
   *
   * Named `purchase` here to match the Meta pixel's call site; it sends
   * CompletePayment, since TikTok has no Purchase event.
   */
  purchase(contents: TrackingContentItem[], value: number, currency: string = 'DZD', eventId?: string): void {
    this.track(TIKTOK_EVENTS.completePayment, this.commerceProperties(contents, value, currency), eventId);
  }

  /** Track a custom / non-standard event. */
  trackCustom(eventName: string, properties?: any, eventId?: string): void {
    this.track(eventName, properties, eventId);
  }
}

/** Normalizes a local Algerian number to E.164, which is what TikTok expects. */
function normalizePhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('213')) return `+${digits}`;
  if (digits.startsWith('0')) return `+213${digits.slice(1)}`;
  return `+${digits}`;
}

export { normalizePhoneE164 };

// Singleton instance. The pixel id is resolved from the <meta> tag or
// config/tracking.ts, so tracking works even if NEXT_PUBLIC_TIKTOK_PIXEL_ID
// never reaches the client bundle.
let tiktokPixelInstance: TikTokPixel | null = null;

export function getTikTokPixel(): TikTokPixel {
  if (!tiktokPixelInstance) {
    tiktokPixelInstance = new TikTokPixel();
  }
  return tiktokPixelInstance;
}
