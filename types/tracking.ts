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

export interface TrackingEventData {
  event_id: string;
  event_name: TrackingEventName;
  event_time?: number;
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
    contents?: TrackingContentItem[];
    num_items?: number;
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
