import "./globals.css";
import type { Viewport } from "next";
import { unstable_noStore as noStore } from "next/cache";
import Providers from "./components/Providers";
import { siteConfig } from "@/config/site";
import { TIKTOK_PIXEL_ID, TIKTOK_PIXEL_META_TAG } from "@/config/tracking";

// Proper mobile rendering: scale to device width, allow user zoom for accessibility.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Opt the layout out of static rendering so process.env is read on every
  // request. Without this, NEXT_PUBLIC_META_PIXEL_ID would be baked at build
  // time — meaning changes to the env var on the host wouldn't take effect
  // until a fresh `next build`. With noStore(), updating the var on Hostinger
  // and restarting the Node process is enough.
  noStore();
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  // TikTok falls back to the id committed in config/tracking.ts, so the pixel
  // fires whether or not the env var reaches this process.
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || TIKTOK_PIXEL_ID;
  // Get primary color for global theme
  const primaryColor = siteConfig.colors.primary;
  const accentColor = siteConfig.colors.accent;
  
  // Convert hex to rgba for scrollbar
  function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const scrollbarThumb = primaryColor;
  const scrollbarThumbHover = hexToRgba(primaryColor, 0.8);
  const selectionBg = primaryColor;

  return (
    <html lang="en" suppressHydrationWarning style={{
      '--scrollbar-thumb': scrollbarThumb,
      '--scrollbar-thumb-hover': scrollbarThumbHover,
      '--selection-bg': selectionBg,
    } as React.CSSProperties}>
      <head>
        <title>Blackbear</title>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://analytics.tiktok.com" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* DIAGNOSTIC: visible in View Source. If you see "missing", the env
            var isn't reaching the running Node process. */}
        <meta name="x-meta-pixel-id" content={metaPixelId ? metaPixelId : 'missing'} />
        <meta name={TIKTOK_PIXEL_META_TAG} content={tiktokPixelId ? tiktokPixelId : 'missing'} />

        {/* Meta Pixel — canonical install, placed in <head> and run inline so
            it fires before React hydration. Anything queued before fbevents.js
            finishes loading is replayed when it does. */}
        {metaPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');try{console.info('[meta-pixel] init + PageView',${JSON.stringify(metaPixelId)});}catch(e){}`,
            }}
          />
        )}

        {/* TikTok Pixel — canonical install, placed in <head> and run inline so
            it fires before React hydration. ttq queues any call made before
            events.js finishes loading and replays them once it does. */}
        {tiktokPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var s=d.createElement("script");s.type="text/javascript",s.async=!0,s.src=r+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(s,a)};ttq.load(${JSON.stringify(tiktokPixelId)});ttq.page();try{console.info('[tiktok-pixel] init + page',${JSON.stringify(tiktokPixelId)});}catch(e){}}(window,document,'ttq');`,
            }}
          />
        )}
      </head>
      <body className="relative antialiased bg-white text-black min-h-screen">
        {/* Meta Pixel noscript fallback (fires PageView when JS is disabled) */}
        {metaPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}
        <div className="relative z-10">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
