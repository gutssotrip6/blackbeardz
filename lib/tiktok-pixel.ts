// lib/tiktok-pixel.ts
// TikTok Pixel browser-side tracking using react-tiktok-helper

import { TrackingEventData, TrackingEventName, TrackingContentItem } from '@/types/tracking';
import { generateEventId, markEventProcessed } from './tracking-utils';
import tiktok from 'react-tiktok-helper';

class TikTokPixel {
  private initialized = false;
  private pixelId: string;

  constructor(pixelId: string) {
    this.pixelId = pixelId;
  }

  /**
   * Initialize TikTok Pixel using react-tiktok-helper
   */
  init(): void {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;

    // Initialize using react-tiktok-helper
    if (this.pixelId) {
      tiktok.config(this.pixelId);
    }

    this.initialized = true;
  }

  /**
   * Track a standard TikTok Pixel event
   */
  track(eventName: string, customData?: any, eventId?: string): void {
    if (typeof window === 'undefined') return;
    if (!this.pixelId) return; // Don't track if pixel ID is not set

    const finalEventId = eventId || generateEventId();
    
    // Mark event as processed for deduplication
    markEventProcessed(finalEventId);

    // Track with event ID for deduplication
    try {
      tiktok.event(eventName, {
        ...customData,
        event_id: finalEventId
      });
    } catch (error) {
      console.error('TikTok pixel tracking error:', error);
    }
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
      content_id: contentId,
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
      content_id: contents[0]?.id,
      content_type: 'product',
      value: value,
      currency: currency,
      quantity: contents.reduce((sum, c) => sum + c.quantity, 0)
    }, eventId);
  }

  /**
   * Track InitiateCheckout event
   */
  initiateCheckout(contents: TrackingContentItem[], value: number, currency: string = 'DZD', eventId?: string): void {
    this.track('InitiateCheckout', {
      contents: contents,
      content_id: contents[0]?.id,
      content_type: 'product',
      value: value,
      currency: currency,
      quantity: contents.reduce((sum, c) => sum + c.quantity, 0)
    }, eventId);
  }

  /**
   * Track Purchase event (browser-side - should be paired with server-side)
   */
  purchase(contents: TrackingContentItem[], value: number, currency: string = 'DZD', eventId?: string): void {
    this.track('Purchase', {
      contents: contents,
      content_id: contents[0]?.id,
      content_type: 'product',
      value: value,
      currency: currency,
      quantity: contents.reduce((sum, c) => sum + c.quantity, 0)
    }, eventId);
  }
}

// Singleton instance
let tiktokPixelInstance: TikTokPixel | null = null;

export function getTikTokPixel(): TikTokPixel {
  if (!tiktokPixelInstance) {
    // @ts-ignore - Next.js provides NEXT_PUBLIC_ vars in client code
    const pixelId = process?.env?.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
    if (!pixelId) {
      console.warn('NEXT_PUBLIC_TIKTOK_PIXEL_ID not set - TikTok Pixel disabled');
      // Return a no-op instance
      tiktokPixelInstance = new TikTokPixel('');
    } else {
      tiktokPixelInstance = new TikTokPixel(pixelId);
    }
  }
  return tiktokPixelInstance;
}
