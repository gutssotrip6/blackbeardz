// app/components/TrackingProvider.tsx
// Initializes tracking pixels and handles SPA route changes

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getMetaPixel } from '@/lib/meta-pixel';
import { getTikTokPixel } from '@/lib/tiktok-pixel';
import { generateEventId } from '@/lib/tracking-utils';

export default function TrackingProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // Meta is initialised by the inline <head> script in layout.tsx.
    // TikTok just needs configuring here.
    getTikTokPixel().init();
  }, []);

  useEffect(() => {
    // Fire a PageView on first load AND every SPA navigation. pageView() →
    // track() sends both the browser pixel and the server-side CAPI event
    // (same event_id, so Meta de-duplicates), so PageViews are recorded even
    // when the browser pixel is blocked.
    const eventId = generateEventId();
    getMetaPixel().pageView(eventId);
    getTikTokPixel().pageView(eventId);
  }, [pathname]);

  return null; // This component doesn't render anything
}
