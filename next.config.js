/** @type {import('next').NextConfig} */

// Resolve the WooCommerce image hostname from env, with no hardcoded domain.
// Prefer an explicit WOOCOMMERCE_IMAGE_DOMAIN, otherwise derive it from the
// WooCommerce site URL. Returns null if neither is available so we can omit the
// pattern entirely instead of producing an invalid (hostname-less) config.
function getWooImageHostname() {
  if (process.env.WOOCOMMERCE_IMAGE_DOMAIN) {
    return process.env.WOOCOMMERCE_IMAGE_DOMAIN;
  }
  try {
    if (process.env.NEXT_PUBLIC_WOOCOMMERCE_URL) {
      return new URL(process.env.NEXT_PUBLIC_WOOCOMMERCE_URL).hostname;
    }
  } catch {
    // invalid URL — fall through to null
  }
  return null;
}

const wooImageHostname = getWooImageHostname();

const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'i*.wp.com',
    pathname: '/**',
  },
];

if (wooImageHostname) {
  remotePatterns.unshift({
    protocol: 'https',
    hostname: wooImageHostname,
    pathname: '/wp-content/uploads/**',
  });
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 86400,
    remotePatterns,
  },
};

module.exports = nextConfig;
