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
  // The pixel snippet (init) already fires the initial PageView, so we skip the
  // first route effect to avoid double-counting, then track every subsequent navigation.
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Initialize pixels on first load (this also fires the initial PageView)
    const metaPixel = getMetaPixel();
    const tiktokPixel = getTikTokPixel();

    metaPixel.init();
    tiktokPixel.init();
  }, []);

  useEffect(() => {
    // Skip the initial render — the initial PageView is fired by init().
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    // Track PageView on subsequent SPA route changes
    const eventId = generateEventId();

    const metaPixel = getMetaPixel();
    const tiktokPixel = getTikTokPixel();

    metaPixel.pageView(eventId);
    tiktokPixel.pageView(eventId);
  }, [pathname]);

  return null; // This component doesn't render anything
}
