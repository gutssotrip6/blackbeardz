// config/tracking.ts
// Central tracking configuration.
//
// Pixel ids live here (not only in env) because this template is deployed to
// hosts where NEXT_PUBLIC_* vars have repeatedly failed to reach the running
// Node process — which silently disables tracking. A committed default means
// the pixel always fires; an env var, when present, still wins.

/**
 * TikTok Pixel id (also called "Pixel Code" in TikTok Events Manager).
 * Used for both the browser pixel and the server-side Events API.
 *
 * Set NEXT_PUBLIC_TIKTOK_PIXEL_ID (and TIKTOK_PIXEL_ID for the server side)
 * in the hosting environment to override this default without a code change.
 */
const TIKTOK_PIXEL_ID_FALLBACK = '7648065853946118145';

// NOTE: must be the exact `process.env.NEXT_PUBLIC_*` member expression so
// Next.js inlines it into the client bundle at build time. Assigning to a
// separate const first keeps the token intact for that replacement.
const tiktokPixelIdFromEnv = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

export const TIKTOK_PIXEL_ID: string =
  (tiktokPixelIdFromEnv && tiktokPixelIdFromEnv.trim()) || TIKTOK_PIXEL_ID_FALLBACK;

/** Name of the <meta> tag carrying the pixel id for client-side fallback init. */
export const TIKTOK_PIXEL_META_TAG = 'x-tiktok-pixel-id';

/** TikTok Events API 2.0 endpoint (v1.2 `pixel/events/` is deprecated). */
export const TIKTOK_EVENTS_API_URL =
  'https://business-api.tiktok.com/open_api/v1.3/event/track/';

/**
 * TikTok's standard web event names.
 *
 * These are NOT the same as Meta's. TikTok has no "Purchase" event — sending
 * one makes it an unrecognized event that can't be optimized or reported
 * against. The funnel maps as:
 *
 *   Meta                TikTok
 *   PageView         →  Pageview          (browser: ttq.page())
 *   ViewContent      →  ViewContent
 *   AddToCart        →  AddToCart
 *   InitiateCheckout →  InitiateCheckout
 *   (order placed)   →  PlaceAnOrder
 *   Purchase         →  CompletePayment
 */
export const TIKTOK_EVENTS = {
  pageView: 'Pageview',
  viewContent: 'ViewContent',
  addToCart: 'AddToCart',
  addToWishlist: 'AddToWishlist',
  initiateCheckout: 'InitiateCheckout',
  addPaymentInfo: 'AddPaymentInfo',
  placeAnOrder: 'PlaceAnOrder',
  completePayment: 'CompletePayment',
  search: 'Search',
  contact: 'Contact',
  submitForm: 'SubmitForm',
  completeRegistration: 'CompleteRegistration',
  subscribe: 'Subscribe',
  clickButton: 'ClickButton',
} as const;

export type TikTokEventName = (typeof TIKTOK_EVENTS)[keyof typeof TIKTOK_EVENTS];

/**
 * Maps the app's internal (Meta-flavoured) event names onto TikTok's vocabulary
 * so a single call site can feed both platforms.
 */
export const TIKTOK_EVENT_NAME_MAP: Record<string, TikTokEventName> = {
  PageView: TIKTOK_EVENTS.pageView,
  Pageview: TIKTOK_EVENTS.pageView,
  ViewContent: TIKTOK_EVENTS.viewContent,
  AddToCart: TIKTOK_EVENTS.addToCart,
  InitiateCheckout: TIKTOK_EVENTS.initiateCheckout,
  AddPaymentInfo: TIKTOK_EVENTS.addPaymentInfo,
  PlaceAnOrder: TIKTOK_EVENTS.placeAnOrder,
  // The critical one: TikTok has no Purchase event.
  Purchase: TIKTOK_EVENTS.completePayment,
  CompletePayment: TIKTOK_EVENTS.completePayment,
};

/** Translates an internal event name to TikTok's, leaving unknowns untouched. */
export function toTikTokEventName(eventName: string): string {
  return TIKTOK_EVENT_NAME_MAP[eventName] || eventName;
}
