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

class MetaPixel {
  private initialized = false;
  private pixelId: string;

  constructor(pixelId: string) {
    this.pixelId = pixelId;
  }

  /**
   * Initialize Meta Pixel - loads script once
   */
  init(): void {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;

    // Load Meta Pixel script
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

    // Initialize pixel
    window.fbq('init', this.pixelId);
    window.fbq('track', 'PageView');

    this.initialized = true;
  }

  /**
   * Track a standard Meta Pixel event
   */
  track(eventName: TrackingEventName, customData?: any, eventId?: string): void {
    if (typeof window === 'undefined' || !window.fbq) return;

    const finalEventId = eventId || generateEventId();
    
    // Mark event as processed for deduplication
    markEventProcessed(finalEventId);

    // Track with event ID for deduplication
    window.fbq('track', eventName, customData, { eventID: finalEventId });
  }

  /**
   * Track custom event
   */
  trackCustom(eventName: string, customData?: any, eventId?: string): void {
    if (typeof window === 'undefined' || !window.fbq) return;

    const finalEventId = eventId || generateEventId();
    markEventProcessed(finalEventId);

    window.fbq('trackCustom', eventName, customData, { eventID: finalEventId });
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

// Singleton instance
let metaPixelInstance: MetaPixel | null = null;

export function getMetaPixel(): MetaPixel {
  if (!metaPixelInstance) {
    // @ts-ignore - Next.js provides NEXT_PUBLIC_ vars in client code
    const pixelId = process?.env?.NEXT_PUBLIC_META_PIXEL_ID;
    if (!pixelId) {
      console.warn('NEXT_PUBLIC_META_PIXEL_ID not set - Meta Pixel disabled');
      // Return a no-op instance
      metaPixelInstance = new MetaPixel('');
    } else {
      metaPixelInstance = new MetaPixel(pixelId);
    }
  }
  return metaPixelInstance;
}
