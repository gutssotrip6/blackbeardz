# Algerian E-commerce Template

A production-ready e-commerce template specifically designed for Algerian businesses. Built with Next.js 15, React 19, and WooCommerce headless integration.

## Features

- **WooCommerce Headless Integration**: Connect to any WooCommerce store via REST API
- **Meta & TikTok Pixel Tracking**: Browser and server-side event tracking
- **COD Payment Only**: Cash on delivery payment method optimized for Algeria
- **Multi-language Support**: English and Arabic with RTL layout
- **Algerian-specific Features**:
  - Wilaya/City data (58 wilayas with cities)
  - DZD currency
  - Algerian phone format validation
  - Delivery fee calculation based on wilaya
- **Easy Customization**: Centralized configuration for branding, colors, and features
- **Feature Flags**: Enable/disable splash screen, 3D logo, background video, audio
- **Dynamic Categories**: Product categories fetched from WooCommerce
- **Node.js Deployment**: Deploy as a Node.js application

## Prerequisites

- Node.js 18+ 
- WordPress with WooCommerce installed
- WooCommerce REST API keys (Read/Write permissions)
- Meta Pixel ID and Access Token
- TikTok Pixel ID and Access Token

## Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# WooCommerce
NEXT_PUBLIC_WOOCOMMERCE_URL=https://your-store.com
NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY=ck_xxxxx
NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxx
WOOCOMMERCE_IMAGE_DOMAIN=your-store.com

# Meta Pixel
NEXT_PUBLIC_META_PIXEL_ID=your-pixel-id
META_ACCESS_TOKEN=your-access-token
META_PIXEL_ID=your-pixel-id

# TikTok Pixel
NEXT_PUBLIC_TIKTOK_PIXEL_ID=your-pixel-id
TIKTOK_ACCESS_TOKEN=your-access-token
TIKTOK_PIXEL_ID=your-pixel-id

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Step 3: Customize Branding

Edit `config/site.ts` to customize:

```typescript
export const siteConfig = {
  name: 'Your Brand Name',
  tagline: 'Your tagline',
  description: 'Your business description',
  
  logo: {
    twoDPath: '/logo.png',  // Put your logo in public/ folder
    width: 200,
    height: 200
  },
  
  colors: {
    primary: '#06b6d4',      // Main brand color
    secondary: '#f97316',    // Secondary color
    accent: '#22d3ee',       // Accent color
    background: '#000000',   // Background color
    text: '#ffffff'          // Text color
  },
  
  contact: {
    phone: '+213 555 123456',
    email: 'contact@yourbrand.com',
    social: {
      facebook: 'https://facebook.com/yourbrand',
      instagram: 'https://instagram.com/yourbrand',
      tiktok: 'https://tiktok.com/@yourbrand'
    }
  },
  
  features: {
    splashScreen: false,     // Show intro animation
    threeDLogo: false,       // Use 3D logo
    backgroundVideo: false,  // Show background video
    backgroundMusic: false,  // Play background music
    marqueeBanner: true      // Show scrolling banner
  }
};
```

### Step 4: Add Your Assets

Place these files in the `public/` folder:
- `logo.png` - Your 2D logo (required)
- `favicon.png` - Your favicon (required)
- `logo.glb` - Your 3D logo (optional, only if using 3D feature)

### Step 5: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your customized site.

## Configuration

### WooCommerce Setup

1. Go to WordPress Admin → WooCommerce → Settings → Advanced → REST API
2. Add new API key with Read/Write permissions
3. Copy Consumer Key and Consumer Secret to `.env.local`

### Meta Pixel Setup

1. Go to [Meta Business Suite](https://facebook.com/business/pixel)
2. Create a new pixel or use existing one
3. Copy Pixel ID to `.env.local`
4. Generate Access Token from [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/)

### TikTok Pixel Setup

1. Go to [TikTok Ads Manager](https://ads.tiktok.com/pixel)
2. Create a new pixel or use existing one
3. Copy Pixel ID to `.env.local`
4. Generate Access Token from TikTok Ads Manager

## Development Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Customization Guide

### Change Colors

Edit `config/site.ts` colors section:

```typescript
colors: {
  primary: '#ff0000',      // Red instead of cyan
  secondary: '#0000ff',    // Blue instead of orange
  // ...
}
```

### Enable/Disable Features

Edit `config/site.ts` features section:

```typescript
features: {
  splashScreen: true,       // Enable splash screen
  threeDLogo: true,         // Enable 3D logo
  backgroundVideo: true,    // Enable background video
  backgroundMusic: true,    // Enable background music
  marqueeBanner: false     // Disable marquee banner
}
```

### Change Logo

1. Put your new `logo.png` in `public/` folder
2. Update path in `config/site.ts`:

```typescript
logo: {
  twoDPath: '/my-new-logo.png',
  // ...
}
```

### Add Social Media Links

Edit `config/site.ts`:

```typescript
contact: {
  social: {
    facebook: 'https://facebook.com/yourbrand',
    instagram: 'https://instagram.com/yourbrand',
    tiktok: 'https://tiktok.com/@yourbrand',
    youtube: 'https://youtube.com/@yourbrand'  // Add this
  }
}
```

### Customize Translations

Edit `app/context/LanguageContext.tsx` to change text in English and Arabic.

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Project Structure

```
├── app/
│   ├── api/           # API routes (orders, tracking)
│   ├── components/    # React components
│   ├── context/       # Context providers (Cart, Language)
│   ├── data/          # Static data (Wilayas)
│   └── layout.tsx     # Root layout
├── config/
│   └── site.ts        # Central configuration
├── lib/
│   ├── woocommerce.ts # WooCommerce API functions
│   └── meta-pixel.ts  # Meta Pixel tracking
├── public/            # Static assets
└── .env.example       # Environment variables template
```

## Troubleshooting

### Products not loading

- Check WooCommerce API credentials in `.env.local`
- Verify WooCommerce URL is correct
- Ensure API keys have Read/Write permissions
- Check browser console for errors

### Pixel events not firing

- Verify Pixel IDs in `.env.local`
- Check Access Tokens are valid
- Ensure Meta/TikTok pixels are configured correctly
- Check browser network tab for API calls

### Build errors

- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## License

This template is provided as-is for use in your projects.

## Support

For issues or questions, please refer to the deployment guide or contact your development team.
