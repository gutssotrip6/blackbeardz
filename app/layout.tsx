import "./globals.css";
import type { Viewport } from "next";
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
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
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
