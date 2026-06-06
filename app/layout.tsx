import "./globals.css";
import type { Viewport } from "next";
import Script from "next/script";
import { unstable_noStore as noStore } from "next/cache";
import Providers from "./components/Providers";
import { siteConfig } from "@/config/site";

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
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="relative antialiased bg-white text-black min-h-screen">
        {/* DIAGNOSTIC: visible in View Source on production. If you see
            "missing", the env var isn't reaching the running Node process. */}
        <div
          dangerouslySetInnerHTML={{
            __html: `<!-- meta-pixel-id: ${metaPixelId ? metaPixelId : 'missing'} -->`,
          }}
        />
        {/* Meta Pixel — base loader + init + initial PageView, server-embedded.
            The pixel ID is inserted into the HTML at render time, so this works
            even if NEXT_PUBLIC_META_PIXEL_ID wasn't inlined into the client
            bundle at build time. Subsequent SPA PageViews come from
            TrackingProvider (which just calls window.fbq directly). */}
        {metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
          </Script>
        )}
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
