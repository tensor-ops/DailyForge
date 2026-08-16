import React from 'react';
import { ThemeLogo, ThemeLogoProps } from './ThemeLogo';
import { ThemeName, LogoVariant, LogoSize } from './themeLogos';

export interface LogoProps extends Omit<ThemeLogoProps, 'variant' | 'theme'> {
  variant?: LogoVariant | 'compact';
  theme?: 'auto' | ThemeName | 'light' | 'dark';
}

/**
 * Standard Daily Forge Logo wrapper.
 * Directly routes to ThemeLogo with theme awareness.
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'auto',
  size = 'md',
  className,
  alt = 'Daily Forge',
  decorative = false,
}) => {
  // Normalize legacy 'light' | 'dark' themes to ThemeName
  let normalizedTheme: 'auto' | ThemeName = 'auto';
  if (theme === 'light') normalizedTheme = 'forge-light';
  else if (theme === 'dark') normalizedTheme = 'forge-dark';
  else normalizedTheme = theme;

  const effectiveVariant: LogoVariant = variant === 'compact' ? 'full' : variant;
  const effectiveSize: LogoSize | number = variant === 'compact' && typeof size === 'string' ? 'sm' : size;

  return (
    <ThemeLogo
      variant={effectiveVariant}
      theme={normalizedTheme}
      size={effectiveSize}
      className={className}
      alt={alt}
      decorative={decorative}
    />
  );
};

export { ThemeLogo } from './ThemeLogo';
export * from './themeLogos';
