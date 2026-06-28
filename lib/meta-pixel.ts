// lib/meta-pixel.ts
// Meta (Facebook) Pixel browser-side tracking

import { TrackingEventData, TrackingEventName, TrackingContentItem } from '@/types/tracking';
import { generateEventId, markEventProcessed } from './tracking-utils';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

/** Read a browser cookie by name (used for Meta's _fbp / _fbc). */
function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
  const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

class MetaPixel {
  /**
   * Fallback initializer. The pixel is normally loaded + inited + PageView'd
   * by the canonical inline snippet in app/layout.tsx <head>. This runs from
   * TrackingProvider as a safety net: if for any reason window.fbq is missing
   * (inline script blocked, stripped, or didn't execute), we load the pixel
   * ourselves. The pixel id is read from the server-rendered <meta> tag, so it
   * works even when NEXT_PUBLIC_META_PIXEL_ID wasn't inlined into the client
   * bundle at build time.
   */
  init(): void {
    if (typeof window === 'undefined') return;
    if (window.fbq) return; // already set up by the <head> snippet — nothing to do

    const id = document
      .querySelector('meta[name="x-meta-pixel-id"]')
      ?.getAttribute('content');
    if (!id || id === 'missing') {
      console.warn('[meta-pixel] no pixel id found (meta tag) — cannot init');
      return;
    }

    ((f: any, b: any, e?: any, v?: any, n?: any, t?: any, s?: any) => {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      } as any;
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      s = b.getElementsByTagName(e)[0];
      s.parentNode?.insertBefore(t, s);
    })(window, document, 'script');

    window.fbq('init', id);
    window.fbq('track', 'PageView');
    console.info('[meta-pixel] fallback init + PageView', id);
  }

  /**
   * Mirror an event to the server-side Conversions API. This is what makes
   * "every event get recorded": the browser pixel can be blocked by ad
   * blockers / ITP / network filters, but a server event cannot. Both carry
   * the same event_id so Meta de-duplicates them into a single event.
   */
  private sendServerEvent(eventName: TrackingEventName, eventId: string, customData?: any): void {
    if (typeof window === 'undefined') return;
    try {
      const payload = {
        event_id: eventId,
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: window.location.href,
        custom_data: customData,
        fbp: readCookie('_fbp'),
        fbc: readCookie('_fbc'),
      };
      // keepalive lets the request finish even if the user navigates away
      // (important for Purchase / InitiateCheckout).
      fetch('/api/tracking/meta', {
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
   * Track a standard Meta Pixel event (browser pixel + server CAPI).
   */
  track(eventName: TrackingEventName, customData?: any, eventId?: string): void {
    if (typeof window === 'undefined') return;

    const finalEventId = eventId || generateEventId();

    // Mark event as processed for deduplication
    markEventProcessed(finalEventId);

    // 1) Browser pixel (best-effort — may be blocked)
    if (window.fbq) {
      window.fbq('track', eventName, customData, { eventID: finalEventId });
    } else {
      console.warn('[meta-pixel] window.fbq not ready (browser pixel skipped)');
    }

    // 2) Server-side Conversions API (always fires, can't be blocked)
    this.sendServerEvent(eventName, finalEventId, customData);

    console.info('[meta-pixel] track', eventName, { eventId: finalEventId });
  }

  /**
   * Track custom event
   */
  trackCustom(eventName: string, customData?: any, eventId?: string): void {
    if (typeof window === 'undefined' || !window.fbq) return;

    const finalEventId = eventId || generateEventId();
    markEventProcessed(finalEventId);

    window.fbq('trackCustom', eventName, customData, { eventID: finalEventId });
    console.info('[meta-pixel] trackCustom', eventName, { customData, eventId: finalEventId });
  }

  /**
   * Track PageView event
   */
  pageView(eventId?: string): void {
    this.track('PageView', undefined, eventId);
  }

  /**
   * Track ViewContent event (product view)
   */
  viewContent(contentId: string, contentName: string, value: number, currency: string = 'DZD', eventId?: string): void {
    this.track('ViewContent', {
      content_ids: [contentId],
      content_name: contentName,
      content_type: 'product',
      value: value,
      currency: currency
    }, eventId);
  }

  /**
   * Track AddToCart event
   */
  addToCart(contents: TrackingContentItem[], value: number, currency: string = 'DZD', eventId?: string): void {
    this.track('AddToCart', {
      contents: contents,
      content_ids: contents.map(c => String(c.id)),
      content_type: 'product',
      value: value,
      currency: currency,
      num_items: contents.reduce((sum, c) => sum + c.quantity, 0)
    }, eventId);
  }

  /**
   * Track InitiateCheckout event
   */
  initiateCheckout(contents: TrackingContentItem[], value: number, currency: string = 'DZD', eventId?: string): void {
    this.track('InitiateCheckout', {
      contents: contents,
      content_ids: contents.map(c => String(c.id)),
      content_type: 'product',
      value: value,
      currency: currency,
      num_items: contents.reduce((sum, c) => sum + c.quantity, 0)
    }, eventId);
  }

  /**
   * Track Purchase event (browser-side - should be paired with server-side)
   */
  purchase(contents: TrackingContentItem[], value: number, currency: string = 'DZD', eventId?: string): void {
    this.track('Purchase', {
      contents: contents,
      content_ids: contents.map(c => String(c.id)),
      content_type: 'product',
      value: value,
      currency: currency,
      num_items: contents.reduce((sum, c) => sum + c.quantity, 0)
    }, eventId);
  }
}

// Singleton instance. The pixel is initialized server-side in app/layout.tsx,
// so the client just dispatches events to window.fbq — it doesn't need to know
// the pixel ID. This means tracking still works even if NEXT_PUBLIC_META_PIXEL_ID
// wasn't inlined into the client bundle at build time.
let metaPixelInstance: MetaPixel | null = null;

export function getMetaPixel(): MetaPixel {
  if (!metaPixelInstance) {
    metaPixelInstance = new MetaPixel();
  }
  return metaPixelInstance;
}
