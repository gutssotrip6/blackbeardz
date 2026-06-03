declare module 'react-tiktok-helper' {
  export interface TikTokEvent {
    content_id?: string;
    content_name?: string;
    content_type?: string;
    contents?: any[];
    value?: number;
    currency?: string;
    quantity?: number;
    event_id?: string;
    [key: string]: any;
  }

  export interface TikTokHelper {
    config(pixelId: string): void;
    event(eventName: string, data?: TikTokEvent): void;
    page(): void;
    track(eventName: string, data?: TikTokEvent): void;
  }

  const tiktok: TikTokHelper;
  export default tiktok;
}
