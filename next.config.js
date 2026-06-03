/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp', 'image/avif' ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.WOOCOMMERCE_IMAGE_DOMAIN,
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'i*.wp.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
