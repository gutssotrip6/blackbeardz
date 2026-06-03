# Deployment Guide

This guide covers deploying the Algerian E-commerce Template to Hostinger using a Windows workflow.

## Prerequisites

- Node.js 18+ installed on Windows
- GitHub account
- Hostinger account (with Node.js hosting)
- WordPress with WooCommerce backend (on a subdomain)
- Domain name configured

## Workflow Overview

1. Build your Next.js application
2. Push to GitHub
3. Deploy to Hostinger
4. Configure WordPress/WooCommerce backend

## Step 1: Build the Application

### 1.1 Install Dependencies

```bash
npm install
```

### 1.2 Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
copy .env.example .env.local
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

### 1.3 Build for Production

```bash
npm run build
```

This creates a `.next` folder with your optimized production build.

## Step 2: Push to GitHub

### 2.1 Initialize Git (if not already done)

```bash
git init
```

### 2.2 Create .gitignore

Create a `.gitignore` file to exclude sensitive files:

```
node_modules
.next
.env.local
.env*.local
```

### 2.3 Commit Changes

```bash
git add .
git commit -m "Initial commit"
```

### 2.4 Push to GitHub

```bash
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

## Step 3: Deploy to Hostinger

### 3.1 Log in to Hostinger

1. Go to [Hostinger](https://hostinger.com)
2. Log in to your account
3. Go to Hosting → Manage

### 3.2 Create a New Node.js Project

1. Click "Create Project"
2. Select "Node.js"
3. Choose your domain or subdomain
4. Click "Create"

### 3.3 Connect to GitHub

1. In the project dashboard, click "Deploy"
2. Select "GitHub"
3. Authorize Hostinger to access your GitHub account
4. Select your repository
5. Select the branch (usually `main`)
6. Click "Connect"

### 3.4 Configure Build Settings

1. In the "Build" section, set:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `18.x` (or latest)

2. Add environment variables in the "Environment Variables" section:
   - Copy all variables from your `.env.local`
   - Add them one by one to Hostinger

### 3.5 Deploy

1. Click "Deploy" button
2. Wait for the build to complete
3. Hostinger will automatically deploy your app

### 3.6 Access Your Site

Once deployed, your site will be available at your configured domain.

## Step 4: Configure WordPress/WooCommerce Backend

### 4.1 Install WordPress

1. In Hostinger, go to "Auto Installer"
2. Select "WordPress"
3. Choose your subdomain (e.g., `store.yourdomain.com`)
4. Complete the installation

### 4.2 Install WooCommerce Plugin

1. Log in to WordPress Admin
2. Go to Plugins → Add New
3. Search for "WooCommerce"
4. Install and activate

### 4.3 Configure WooCommerce

1. Run the WooCommerce setup wizard
2. Set currency to DZD (Algerian Dinar)
3. Configure shipping zones for Algeria
4. Set up payment methods (COD only)

### 4.4 Create REST API Keys

1. Go to WordPress Admin → WooCommerce → Settings → Advanced → REST API
2. Add new API key with Read/Write permissions
3. Copy Consumer Key and Consumer Secret
4. Add to Hostinger environment variables

### 4.5 Add Products

1. Go to WordPress Admin → Products → Add New
2. Add products with categories
3. Set prices in DZD
4. Add product images

## Optional Features (Commented Code)

The template includes several optional features that are commented out by default. You can enable them if needed for your project.

### Feature Locations and Functionality

#### 1. Splash Screen
**File Path:** `app/page.tsx` (lines 40-50)

**Functionality:** Displays an intro animation when users first visit the site. Checks if the user has visited before using localStorage, and if not, redirects to `/splash` page.

**Commented Code:**
```typescript
// Splash check + prefetch
// useEffect(() => {
//   const visited = localStorage.getItem('visited');
//   if (!visited) {
//     window.location.replace('/splash');
//     return;
//   }
//
//   router.prefetch('/winter');
//   router.prefetch('/summer');
//   router.prefetch('/store');
// }, [router]);
```

**Also Update:** `middleware.ts` to respect the splash screen feature flag from `config/site.ts`.

#### 2. Background Video
**File Path:** `app/layout.tsx` (lines 30, 34-46)

**Functionality:** Displays a persistent background video that plays across all pages. Includes a dark overlay to ensure text readability.

**Commented Code:**
```typescript
{/* Preload background video for faster start */}
{/* <link rel="preload" href="/background.webm" as="video" type="video/webm" /> */}

{/* PERSISTENT BACKGROUND VIDEO - Loads once, stays for all pages */}
{/* <video
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
  className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
>
  <source src="/background.webm" type="video/webm" />
</video>

{/* Overlay */}
<div className="fixed inset-0 bg-black/30 z-0 pointer-events-none" /> */}
```

**Also Update:** `app/page.tsx` has video-related code commented out (lines 25, 35, 52-62).

#### 3. Background Music (Audio Player)
**File Path:** `app/layout.tsx` (lines 6, 10, 55, 44, 46)

**Functionality:** Provides background music with a toggle button to play/pause. Uses an AudioContext to manage audio playback.

**Commented Code:**
```typescript
// import { AudioProvider } from "./context/AudioContext";
// import AudioToggle from "./components/ui/AudioToggle";

{/* <AudioProvider> */}
  <CartProvider>
    {children}
    <CartButton />
    <CartDrawer />
    <CheckoutModal />
    {/* <AudioToggle /> */}
  </CartProvider>
{/* </AudioProvider> */}
```

**Required Files:** Ensure `app/context/AudioContext.tsx` and `app/components/ui/AudioToggle.tsx` exist in your project.

### How to Uncomment Features

#### To Enable Splash Screen

1. Open `app/page.tsx`
2. Find lines 40-50 (the splash screen useEffect)
3. Remove the `//` from each line to uncomment the entire block:
   ```typescript
   // Splash check + prefetch
   useEffect(() => {
     const visited = localStorage.getItem('visited');
     if (!visited) {
       window.location.replace('/splash');
       return;
     }

     router.prefetch('/winter');
     router.prefetch('/summer');
     router.prefetch('/store');
   }, [router]);
   ```
4. Open `middleware.ts` and ensure it checks the splash screen feature flag from `config/site.ts`
5. Ensure you have a splash page at `app/splash/page.tsx`

#### To Enable Background Video

1. Open `app/layout.tsx`
2. Uncomment line 30 (preload link):
   ```typescript
   <link rel="preload" href="/background.webm" as="video" type="video/webm" />
   ```
3. Uncomment lines 34-46 (video element and overlay):
   ```typescript
   {/* PERSISTENT BACKGROUND VIDEO - Loads once, stays for all pages */}
   <video
     autoPlay
     muted
     loop
     playsInline
     preload="auto"
     className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
   >
     <source src="/background.webm" type="video/webm" />
   </video>

   {/* Overlay */}
   <div className="fixed inset-0 bg-black/30 z-0 pointer-events-none" />
   ```
4. Comment out or remove the gradient background (line 49):
   ```typescript
   {/* Simple gradient background instead of video */}
   {/* <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-black to-slate-900 z-0 pointer-events-none" /> */}
   ```
5. Open `app/page.tsx` and uncomment the video-related code (lines 25, 35, 52-62)
6. Ensure you have a video file at `public/background.webm`

#### To Enable Background Music

1. Open `app/layout.tsx`
2. Uncomment line 6 (AudioProvider import):
   ```typescript
   import { AudioProvider } from "./context/AudioContext";
   ```
3. Uncomment line 10 (AudioToggle import):
   ```typescript
   import AudioToggle from "./components/ui/AudioToggle";
   ```
4. Uncomment line 55 (AudioProvider opening tag):
   ```typescript
   <AudioProvider>
   ```
5. Uncomment line 44 (AudioToggle component):
   ```typescript
   <AudioToggle />
   ```
6. Uncomment line 46 (AudioProvider closing tag):
   ```typescript
   </AudioProvider>
   ```
7. Ensure the audio context and toggle component files exist in your project

### Feature Flags Alternative

Instead of uncommenting code, you can also use the feature flags in `config/site.ts`:

```typescript
features: {
  splashScreen: true,      // Enable splash screen
  threeDLogo: true,        // Enable 3D logo
  backgroundVideo: true,   // Enable background video
  backgroundMusic: true,   // Enable background music
  marqueeBanner: true      // Enable marquee banner
}
```

**Note:** Currently, only the 3D logo feature is fully implemented with feature flags. Other features require manual uncommenting as described above.

## Testing Checklist

### Before Going Live

- [ ] All environment variables are set in Hostinger
- [ ] WooCommerce API keys are working
- [ ] Products load from WooCommerce
- [ ] Categories are dynamic
- [ ] Add to cart works
- [ ] Checkout with COD works
- [ ] Meta Pixel events fire
- [ ] TikTok Pixel events fire
- [ ] Language toggle works (EN/AR)
- [ ] RTL layout works correctly
- [ ] Wilaya/City selection works
- [ ] Delivery fees calculate correctly
- [ ] Domain is pointing correctly

### After Going Live

- [ ] Test complete user flow
- [ ] Check browser console for errors
- [ ] Verify pixel tracking in Meta/TikTok dashboards
- [ ] Test on mobile devices
- [ ] Test payment flow

## Updates and Maintenance

### Update Application

1. Make changes locally
2. Build: `npm run build`
3. Commit and push to GitHub
4. Hostinger will auto-deploy

### Update Dependencies

```bash
npm update
npm run build
git add .
git commit -m "Update dependencies"
git push
```

## Troubleshooting

### Build Fails in Hostinger

- Check build logs in Hostinger dashboard
- Ensure all environment variables are set
- Verify Node.js version matches your local version
- Check if all dependencies are in `package.json`

### WooCommerce API Errors

- Verify API keys in Hostinger environment variables
- Check WooCommerce URL is correct
- Ensure API keys have Read/Write permissions
- Test API endpoint directly in browser

### Products Not Loading

- Check Hostinger logs for errors
- Verify WooCommerce is accessible
- Check CORS settings in WordPress
- Ensure API keys are correct

### Build Errors Locally

```bash
# Clear Next.js cache
rmdir /s /q .next

# Clear node_modules and reinstall
rmdir /s /q node_modules
npm install

# Rebuild
npm run build
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to GitHub
2. **HTTPS**: Hostinger provides free SSL certificates
3. **Updates**: Keep Node.js and dependencies updated
4. **Backups**: Hostinger provides automatic backups
5. **Strong Passwords**: Use strong passwords for WordPress and Hostinger

## Support

For issues related to:
- **Hostinger**: Contact Hostinger support
- **WooCommerce**: Refer to [WooCommerce Documentation](https://woocommerce.com/documentation/)
- **Next.js**: Refer to [Next.js Documentation](https://nextjs.org/docs)
- **GitHub**: Refer to [GitHub Documentation](https://docs.github.com)
