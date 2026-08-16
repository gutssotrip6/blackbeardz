// types/tracking.ts
// Production-grade tracking types for Meta and TikTok

export type TrackingEventName = 
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

export interface TrackingContentItem {
  id: string | number;
  quantity: number;
  item_price: number;
  title?: string;
  description?: string;
  category?: string;
}

/** A content item in TikTok's own shape (what the TikTok pixel sends). */
export interface TikTokContentItem {
  content_id: string;
  content_type?: string;
  content_name?: string;
  content_category?: string;
  quantity: number;
  price: number;
}

export interface TrackingEventData {
  event_id: string;
  /**
   * Internal (Meta-flavoured) event name, or a TikTok one. The TikTok route
   * translates it — see toTikTokEventName in config/tracking.ts.
   */
  event_name: TrackingEventName | string;
  event_time?: number;
  event_source_url?: string;
  /** Referring URL, forwarded to TikTok as page.referrer. */
  referrer?: string;
  /** Meta browser cookie (_fbp) — passed through unhashed to the CAPI. */
  fbp?: string;
  /** Meta click id cookie (_fbc) — passed through unhashed to the CAPI. */
  fbc?: string;
  /** TikTok click id from the `?ttclid=` ad-click param. Sent unhashed. */
  ttclid?: string;
  /** TikTok first-party cookie (_ttp). Sent unhashed. */
  ttp?: string;
  user_data?: {
    email?: string;
    phone?: string;
    external_id?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_ids?: string[];
    content_id?: string;
    content_name?: string;
    content_category?: string;
    content_type?: string;
    /** Meta shape (id/item_price) or TikTok shape (content_id/price). */
    contents?: (TrackingContentItem | TikTokContentItem)[];
    num_items?: number;
    quantity?: number;
    /** Order id, used as external_id / order_id where supported. */
    order_id?: string;
  };
}

export interface MetaPixelConfig {
  pixelId: string;
}

export interface TikTokPixelConfig {
  pixelId: string;
}

export interface MetaConversionsAPIConfig {
  accessToken: string;
  pixelId: string;
  testEventCode?: string;
}

export interface TikTokEventsAPIConfig {
  accessToken: string;
  pixelId: string;
  testEventCode?: string;
}

export interface ServerTrackingResponse {
  success: boolean;
  message?: string;
  eventId?: string;
  platform?: 'meta' | 'tiktok';
}
