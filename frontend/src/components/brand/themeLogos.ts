/**
 * DAILY FORGE — THEME LOGO CENTRAL CONFIGURATION
 * 
 * Single source of truth for all Daily Forge branding assets,
 * theme names, variants, and dimensions.
 */

export type ThemeName =
  | 'forge-dark'
  | 'forge-light'
  | 'focus-blue'
  | 'forest'
  | 'amber-forge'
  | 'monochrome';

export type LogoVariant = 'full' | 'icon';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ThemeLogoConfig {
  id: ThemeName;
  name: string;
  description: string;
  paletteDescription: string;
  full: string;
  icon: string;
  previewColors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export const themeLogos: Record<ThemeName, ThemeLogoConfig> = {
  'forge-dark': {
    id: 'forge-dark',
    name: 'Forge Dark',
    description: 'The signature Daily Forge dark aesthetic with high-energy amber and vivid blue.',
    paletteDescription: 'Orange + Blue + White',
    full: '/logos/daily-forge-logo-forge-dark.svg',
    icon: '/logos/daily-forge-icon-forge-dark.svg',
    previewColors: {
      primary: '#FF6A00',
      secondary: '#1687FF',
      background: '#080C14',
    },
  },
  'forge-light': {
    id: 'forge-light',
    name: 'Forge Light',
    description: 'A crisp, high-clarity daylight theme with vibrant orange accents and deep navy text.',
    paletteDescription: 'Orange + Deep Blue + Navy',
    full: '/logos/daily-forge-logo-forge-light.svg',
    icon: '/logos/daily-forge-icon-forge-light.svg',
    previewColors: {
      primary: '#F05A00',
      secondary: '#155EEF',
      background: '#F5F7FB',
    },
  },
  'focus-blue': {
    id: 'focus-blue',
    name: 'Focus Blue',
    description: 'Designed for deep work sessions with electric blue and luminous cyan tones.',
    paletteDescription: 'Electric Blue + Cyan + White',
    full: '/logos/daily-forge-logo-focus-blue.svg',
    icon: '/logos/daily-forge-icon-focus-blue.svg',
    previewColors: {
      primary: '#1687FF',
      secondary: '#00C2FF',
      background: '#07101E',
    },
  },
  'forest': {
    id: 'forest',
    name: 'Forest',
    description: 'Growth and habit sustainability inspired by emerald greens and refreshing teal.',
    paletteDescription: 'Emerald + Teal + White',
    full: '/logos/daily-forge-logo-forest.svg',
    icon: '/logos/daily-forge-icon-forest.svg',
    previewColors: {
      primary: '#16B878',
      secondary: '#20C997',
      background: '#081410',
    },
  },
  'amber-forge': {
    id: 'amber-forge',
    name: 'Amber Forge',
    description: 'Radiant warmth, relentless momentum, and golden forge energy.',
    paletteDescription: 'Amber + Orange + Warm White',
    full: '/logos/daily-forge-logo-amber-forge.svg',
    icon: '/logos/daily-forge-icon-amber-forge.svg',
    previewColors: {
      primary: '#FFB000',
      secondary: '#FF6A00',
      background: '#120D06',
    },
  },
  'monochrome': {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Minimalist, distraction-free aesthetic in pure silver, slate, and charcoal.',
    paletteDescription: 'White + Slate + Gray',
    full: '/logos/daily-forge-logo-monochrome.svg',
    icon: '/logos/daily-forge-icon-monochrome.svg',
    previewColors: {
      primary: '#FFFFFF',
      secondary: '#94A3B8',
      background: '#0B0F17',
    },
  },
};

/**
 * Size dimension mappings in pixels for full and icon variants.
 */
export const logoSizeStyles: Record<
  LogoSize,
  {
    fullHeight: number;
    fullWidth: number;
    iconSize: number;
    wrapperClass: string;
  }
> = {
  xs: {
    fullHeight: 20,
    fullWidth: 69,
    iconSize: 18,
    wrapperClass: 'h-5',
  },
  sm: {
    fullHeight: 28,
    fullWidth: 97,
    iconSize: 24,
    wrapperClass: 'h-7',
  },
  md: {
    fullHeight: 36,
    fullWidth: 125,
    iconSize: 32,
    wrapperClass: 'h-9',
  },
  lg: {
    fullHeight: 48,
    fullWidth: 166,
    iconSize: 42,
    wrapperClass: 'h-12',
  },
  xl: {
    fullHeight: 64,
    fullWidth: 222,
    iconSize: 56,
    wrapperClass: 'h-16',
  },
};
