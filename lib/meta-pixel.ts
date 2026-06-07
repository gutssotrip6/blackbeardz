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
  /**
   * No-op: the base loader, fbq('init', ...) and the initial PageView are
   * server-embedded in app/layout.tsx so window.fbq is ready before any
   * client effect runs. Kept for backwards-compat with TrackingProvider.
   */
  init(): void {
    /* intentionally empty */
  }

  /**
   * Track a standard Meta Pixel event
   */
  track(eventName: TrackingEventName, customData?: any, eventId?: string): void {
    if (typeof window === 'undefined') return;
    if (!window.fbq) {
      console.warn('[meta-pixel] window.fbq not ready, dropping', eventName);
      return;
    }

    const finalEventId = eventId || generateEventId();

    // Mark event as processed for deduplication
    markEventProcessed(finalEventId);

    // Track with event ID for deduplication
    window.fbq('track', eventName, customData, { eventID: finalEventId });
    console.info('[meta-pixel] track', eventName, { customData, eventId: finalEventId });
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
