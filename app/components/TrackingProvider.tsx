// app/components/TrackingProvider.tsx
// Initializes tracking pixels and handles SPA route changes

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getMetaPixel } from '@/lib/meta-pixel';
import { getTikTokPixel } from '@/lib/tiktok-pixel';
import { generateEventId } from '@/lib/tracking-utils';

export default function TrackingProvider() {
  const pathname = usePathname();
  // The inline <head> snippet fires the very first PageView, so skip the first
  // run of the navigation effect to avoid double-counting it.
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Safety net: if the inline <head> snippet didn't run, this loads + inits
    // the Meta pixel (and fires its first PageView) from the meta-tag id.
    getMetaPixel().init();
    getTikTokPixel().init();
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    // Every SPA navigation → browser pixel + server CAPI (same event_id).
    const eventId = generateEventId();
    getMetaPixel().pageView(eventId);
    getTikTokPixel().pageView(eventId);
  }, [pathname]);

  return null; // This component doesn't render anything
}
