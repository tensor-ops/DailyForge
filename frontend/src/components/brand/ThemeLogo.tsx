import React, { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import {
  ThemeName,
  LogoVariant,
  LogoSize,
  themeLogos,
  logoSizeStyles,
} from './themeLogos';
import { cn } from '@/utils/cn';

export interface ThemeLogoProps {
  /**
   * Logo presentation format:
   * - 'full': Complete Daily Forge wordmark + flame check loop
   * - 'icon': Flame check loop badge only (ideal for collapsed navigation, favicons, compact badges)
   */
  variant?: LogoVariant;

  /**
   * Theme variant to render:
   * - 'auto': Dynamically tracks the currently active application theme
   * - ThemeName: Explicitly locks the logo to a specific theme
   */
  theme?: 'auto' | ThemeName;

  /**
   * Preset size or explicit pixel dimension:
   * - 'xs' | 'sm' | 'md' | 'lg' | 'xl'
   */
  size?: LogoSize | number;

  /**
   * Custom CSS classes for the container
   */
  className?: string;

  /**
   * Accessible alternative text
   */
  alt?: string;

  /**
   * Set to true if the logo is accompanied by visible "Daily Forge" text
   * to avoid redundant screen reader announcements.
   */
  decorative?: boolean;
}

export const ThemeLogo: React.FC<ThemeLogoProps> = ({
  variant = 'full',
  theme = 'auto',
  size = 'md',
  className,
  alt = 'Daily Forge',
  decorative = false,
}) => {
  const { currentTheme } = useTheme();

  // Determine active theme name
  const effectiveTheme: ThemeName =
    theme === 'auto' ? currentTheme || 'forge-dark' : theme;

  const logoConfig = themeLogos[effectiveTheme] || themeLogos['forge-dark'];
  const src = variant === 'icon' ? logoConfig.icon : logoConfig.full;

  // Track image load for smooth 150-250ms fade transition without flicker
  const [loadedSrc, setLoadedSrc] = useState(src);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (src !== loadedSrc) {
      setIsTransitioning(true);
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setLoadedSrc(src);
        setIsTransitioning(false);
      };
      img.onerror = () => {
        // Fallback gracefully
        setLoadedSrc(src);
        setIsTransitioning(false);
      };
    }
  }, [src, loadedSrc]);

  // Compute width/height styles
  let height: number;
  let width: number;
  let wrapperClass = '';

  if (typeof size === 'number') {
    if (variant === 'icon') {
      height = size;
      width = size;
    } else {
      height = size;
      width = Math.round(size * (900 / 260)); // Standard SVG viewBox ratio (900:260)
    }
  } else {
    const sizeConfig = logoSizeStyles[size] || logoSizeStyles.md;
    wrapperClass = sizeConfig.wrapperClass;
    if (variant === 'icon') {
      height = sizeConfig.iconSize;
      width = sizeConfig.iconSize;
    } else {
      height = sizeConfig.fullHeight;
      width = sizeConfig.fullWidth;
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center shrink-0 select-none overflow-hidden',
        wrapperClass,
        className
      )}
      style={{
        height: `${height}px`,
        width: `${width}px`,
      }}
      aria-hidden={decorative ? true : undefined}
    >
      <img
        src={loadedSrc}
        alt={decorative ? '' : alt}
        width={width}
        height={height}
        className={cn(
          'w-full h-full object-contain pointer-events-none transition-opacity duration-200 ease-in-out',
          isTransitioning ? 'opacity-80 scale-[0.99]' : 'opacity-100 scale-100'
        )}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};
