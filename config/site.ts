// config/site.ts
// Central configuration file for easy customization of the template
// DONT TOUCH THIS SCROLL DOWN AND EDIT THE NEXT ONE !!!!! 
// DONT TOUCH THIS SCROLL DOWN AND EDIT THE NEXT ONE !!!!! 
// DONT TOUCH THIS SCROLL DOWN AND EDIT THE NEXT ONE !!!!! 
// DONT TOUCH THIS SCROLL DOWN AND EDIT THE NEXT ONE !!!!! 
// DONT TOUCH THIS SCROLL DOWN AND EDIT THE NEXT ONE !!!!! 
// DONT TOUCH THIS SCROLL DOWN AND EDIT THE NEXT ONE !!!!! 
// DONT TOUCH THIS SCROLL DOWN AND EDIT THE NEXT ONE !!!!! 
// DONT TOUCH THIS SCROLL DOWN AND EDIT THE NEXT ONE !!!!! 
// DONT TOUCH THIS SCROLL DOWN AND EDIT THE NEXT ONE !!!!! 
// DONT TOUCH THIS SCROLL DOWN AND EDIT THE NEXT ONE !!!!! 
// MA TMESCH HADI MES LI MORAHA !!!! 
// MA TMESCH HADI MES LI MORAHA !!!! 
// MA TMESCH HADI MES LI MORAHA !!!! 
// MA TMESCH HADI MES LI MORAHA !!!! 
// MA TMESCH HADI MES LI MORAHA !!!! 
// MA TMESCH HADI MES LI MORAHA !!!! 
// MA TMESCH HADI MES LI MORAHA !!!! 
// MA TMESCH HADI MES LI MORAHA !!!! 
// MA TMESCH HADI MES LI MORAHA !!!! 
// MA TMESCH HADI MES LI MORAHA !!!! 
// MA TMESCH HADI MES LI MORAHA !!!! 

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  logo: {
    threeDPath: string;
    twoDPath: string;
    width: number;
    height: number;
  };
  favicon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  currency: string;
  currencySymbol: string;
  contact: {
    phones: string[];
    email: string;
    address: string;
    social: {
      facebook?: string;
      instagram?: string;
      tiktok?: string;
      youtube?: string;
      twitter?: string;
    };
  };
  features: {
    splashScreen: boolean;
    threeDLogo: boolean;
    backgroundVideo: boolean;
    backgroundMusic: boolean;
    marqueeBanner: boolean;
  };
  categoryImages: {
    [key: string]: string;
  };
  navigationCategories: {
    name: string;
    slug: string;
    translationKey: string;
  }[];
  theme: {
    primary: string;
    secondary: string;
  };
}
// THIS ONE 
// THIS ONE 
// THIS ONE 
// THIS ONE 
// THIS ONE 
export const siteConfig: SiteConfig = {
  // Basic Info
  name: 'BlackBear',
  tagline: 'Warrior Factory',
  description: 'Your favorite gym brand',

  // Logo Management
  logo: {
    // 3D logo (optional - set feature flag to false to disable)
    threeDPath: '/logo.glb',  // Put your 3D logo in public/ folder
    // 2D fallback logo (always shown if 3D disabled)
    twoDPath: '/favicon.png',  // Put your PNG logo in public/ folder
    width: 200,               // Logo width in pixels
    height: 200               // Logo height in pixels
  },

  // Favicon
  favicon: '/favicon.png',    // Put your favicon in public/ folder

  // Colors (change these to match your brand)
  colors: {
    primary: '#000000',      // Main brand color
    secondary: '#000000',    // Secondary color
    accent: '#000000',       // Accent color
    background: '#ffffff',   // Background color
    text: '#000000'          // Text color
  },

  // Currency
  currency: 'DZD',
  currencySymbol: 'DA',

  // Contact Info
  contact: {
    phones: ['+213 791581617'],
    email: 'blackbear884@gmail.com',
    address: 'Algeria',
    social: {
      facebook: '',
      instagram: 'https://www.instagram.com/blackbear.dz/',
      tiktok: ''
    }
  },

  // Feature Flags (true = enabled, false = disabled)
  features: {
    splashScreen: false,     // Show intro animation on first visit
    threeDLogo: false,       // Use 3D logo (requires .glb file)
    backgroundVideo: false,  // Show background video
    backgroundMusic: false,  // Play background music
    marqueeBanner: true      // Show scrolling text banner
  },

  // Category Images (put these in public/ folder)
  categoryImages: {
    man: '/Man.png',
    women: '/women.png',
    // Add more as needed for your categories
  },

  // Navigation Categories (now fetched dynamically from WooCommerce)
  navigationCategories: [],

  // Theme Configuration (maps theme names to color values)
  theme: {
    primary: 'primary',   // Uses colors.primary
    secondary: 'secondary' // Uses colors.secondary
  }
};
