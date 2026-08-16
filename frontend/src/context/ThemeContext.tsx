import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeName, themeLogos } from '@/components/brand/themeLogos';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentTheme = 'midnight' | 'arctic' | 'indigo' | 'emerald' | 'ember' | 'rose';
export type { ThemeName };

interface ThemeContextType {
  // Mode & Accent
  theme: ThemeMode;
  accentTheme: AccentTheme;
  resolvedTheme: 'light' | 'dark';

  // First-class Daily Forge Theme System
  currentTheme: ThemeName;
  setThemeName: (name: ThemeName) => void;

  // Setters & Actions
  setTheme: (theme: ThemeMode) => void;
  setAccentTheme: (accent: AccentTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'df-theme';
const ACCENT_KEY = 'df-accent';
const THEME_NAME_KEY = 'df-theme-name';

const THEME_CLASSES: ThemeName[] = [
  'forge-dark',
  'forge-light',
  'focus-blue',
  'forest',
  'amber-forge',
  'monochrome',
];

const ACCENT_CLASSES: AccentTheme[] = [
  'midnight',
  'arctic',
  'indigo',
  'emerald',
  'ember',
  'rose',
];

/**
 * Maps a Daily Forge ThemeName to its base mode and accent theme.
 */
function themeNameToModeAndAccent(name: ThemeName): { mode: ThemeMode; accent: AccentTheme } {
  switch (name) {
    case 'forge-light':
      return { mode: 'light', accent: 'ember' };
    case 'focus-blue':
      return { mode: 'dark', accent: 'arctic' };
    case 'forest':
      return { mode: 'dark', accent: 'emerald' };
    case 'amber-forge':
      return { mode: 'dark', accent: 'ember' };
    case 'monochrome':
      return { mode: 'dark', accent: 'midnight' };
    case 'forge-dark':
    default:
      return { mode: 'dark', accent: 'midnight' };
  }
}

/**
 * Derives a ThemeName from current mode and accent theme.
 */
function deriveThemeName(isDark: boolean, accent: AccentTheme, storedThemeName?: ThemeName | null): ThemeName {
  if (!isDark) return 'forge-light';
  if (storedThemeName && storedThemeName !== 'forge-light') return storedThemeName;

  switch (accent) {
    case 'emerald':
      return 'forest';
    case 'arctic':
      return 'focus-blue';
    case 'ember':
      return 'amber-forge';
    case 'midnight':
    case 'indigo':
    case 'rose':
    default:
      return 'forge-dark';
  }
}

function updateFavicon(themeName: ThemeName) {
  try {
    const iconConfig = themeLogos[themeName];
    if (!iconConfig) return;
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      link.href = iconConfig.icon;
    }
  } catch {
    // Ignore in non-browser environments
  }
}

function applyThemeClasses(isDark: boolean, accent: AccentTheme, themeName: ThemeName) {
  const root = document.documentElement;

  // 1. Apply dark/light base
  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }

  // 2. Apply theme name class (e.g. theme-forge-dark, theme-forest)
  THEME_CLASSES.forEach((t) => root.classList.remove(`theme-${t}`));
  root.classList.add(`theme-${themeName}`);

  // 3. Apply accent class (remove all others first)
  ACCENT_CLASSES.forEach((a) => root.classList.remove(`accent-${a}`));
  root.classList.add(`accent-${accent}`);

  // 4. Update dynamic favicon
  updateFavicon(themeName);
}

function getInitialTheme(): ThemeMode {
  try {
    return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'dark';
  } catch {
    return 'dark';
  }
}

function getInitialAccent(): AccentTheme {
  try {
    return (localStorage.getItem(ACCENT_KEY) as AccentTheme) || 'midnight';
  } catch {
    return 'midnight';
  }
}

function getInitialThemeName(): ThemeName {
  try {
    const stored = localStorage.getItem(THEME_NAME_KEY) as ThemeName;
    if (stored && THEME_CLASSES.includes(stored)) return stored;
    const mode = getInitialTheme();
    return mode === 'light' ? 'forge-light' : 'forge-dark';
  } catch {
    return 'forge-dark';
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const [accentTheme, setAccentState] = useState<AccentTheme>(getInitialAccent);
  const [themeName, setThemeNameState] = useState<ThemeName>(getInitialThemeName);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // React to system color scheme changes if mode is 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      let isDark = false;
      if (theme === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = theme === 'dark';
      }

      setResolvedTheme(isDark ? 'dark' : 'light');

      const derived = deriveThemeName(isDark, accentTheme, themeName);
      setThemeNameState(derived);
      applyThemeClasses(isDark, accentTheme, derived);
    };

    updateTheme();

    const listener = () => {
      if (theme === 'system') updateTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme, accentTheme]);

  /**
   * Set one of the 6 official Daily Forge Themes directly.
   */
  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name);
    try {
      localStorage.setItem(THEME_NAME_KEY, name);
    } catch {
      /* noop */
    }

    const { mode, accent } = themeNameToModeAndAccent(name);
    setThemeState(mode);
    setAccentState(accent);
    try {
      localStorage.setItem(THEME_KEY, mode);
      localStorage.setItem(ACCENT_KEY, accent);
    } catch {
      /* noop */
    }

    const isDark = mode === 'dark';
    setResolvedTheme(isDark ? 'dark' : 'light');
    applyThemeClasses(isDark, accent, name);
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch {
      /* noop */
    }

    const isDark = newTheme === 'dark';
    const newName: ThemeName = isDark
      ? themeName === 'forge-light'
        ? 'forge-dark'
        : themeName
      : 'forge-light';

    setThemeNameState(newName);
    try {
      localStorage.setItem(THEME_NAME_KEY, newName);
    } catch {
      /* noop */
    }
  };

  const setAccentTheme = (accent: AccentTheme) => {
    setAccentState(accent);
    try {
      localStorage.setItem(ACCENT_KEY, accent);
    } catch {
      /* noop */
    }

    const derived = deriveThemeName(resolvedTheme === 'dark', accent, null);
    setThemeNameState(derived);
    try {
      localStorage.setItem(THEME_NAME_KEY, derived);
    } catch {
      /* noop */
    }
  };

  const toggleTheme = () => {
    const nextMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accentTheme,
        resolvedTheme,
        currentTheme: themeName,
        setThemeName,
        setTheme,
        setAccentTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
