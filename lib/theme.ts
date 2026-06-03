// lib/theme.ts
// Centralized theme utility using siteConfig.colors

import { siteConfig } from '@/config/site';

export type Theme = 'primary' | 'secondary';

export interface ThemeColors {
  border: string;
  borderHover: string;
  text: string;
  textMuted: string;
  textHover: string;
  hover: string;
  iconHover: string;
  badge: string;
  titleGradient: string;
  activeBg: string;
  marqueeBg: string;
  marqueeText: string;
  cssVars: React.CSSProperties;
}

/**
 * Convert hex to rgba with opacity
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get theme colors based on theme name
 * Uses actual hex colors from siteConfig.colors with CSS variables
 */
export function getThemeColors(theme: Theme): ThemeColors {
  const colorKey = siteConfig.theme[theme];
  const baseColor = siteConfig.colors[colorKey as keyof typeof siteConfig.colors];
  const accentColor = siteConfig.colors.accent;
  
  const border = hexToRgba(baseColor, 0.3);
  const borderHover = hexToRgba(baseColor, 0.6);
  const text = baseColor;
  const textMuted = hexToRgba(baseColor, 0.6);
  const titleGradientStart = hexToRgba(baseColor, 0.8);
  const marqueeBgStart = hexToRgba(baseColor, 0.8);
  const marqueeBgMid = hexToRgba(accentColor, 0.8);
  const marqueeText = hexToRgba(baseColor, 0.9);
  
  return {
    border: 'border-[var(--theme-border)]',
    borderHover: 'group-hover:border-[var(--theme-border-hover)]',
    text: 'text-[var(--theme-text)]',
    textMuted: 'text-[var(--theme-text-muted)]',
    textHover: 'group-hover:text-[var(--theme-text)]',
    hover: 'hover:text-[var(--theme-text)]',
    iconHover: 'hover:bg-[var(--theme-text)]',
    badge: 'bg-[var(--theme-text)]',
    titleGradient: 'from-black via-gray-700 to-black',
    activeBg: 'from-black to-gray-800',
    marqueeBg: 'bg-gray-100',
    marqueeText: 'text-black',
    cssVars: {
      '--theme-border': border,
      '--theme-border-hover': borderHover,
      '--theme-text': text,
      '--theme-text-muted': textMuted,
      '--theme-title-start': titleGradientStart,
      '--theme-accent': accentColor,
      '--theme-marquee-start': marqueeBgStart,
      '--theme-marquee-mid': marqueeBgMid,
      '--theme-marquee-text': marqueeText,
    } as React.CSSProperties,
  };
}

/**
 * Get theme based on category name
 * Summer categories use secondary theme, others use primary
 */
export function getThemeForCategory(categoryName: string): Theme {
  return categoryName.toLowerCase() === 'summer' ? 'secondary' : 'primary';
}
