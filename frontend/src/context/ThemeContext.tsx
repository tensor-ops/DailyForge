import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentTheme = 'midnight' | 'arctic' | 'indigo' | 'emerald' | 'ember' | 'rose';

interface ThemeContextType {
  theme: ThemeMode;
  accentTheme: AccentTheme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  setAccentTheme: (accent: AccentTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'df-theme';
const ACCENT_KEY = 'df-accent';

const ACCENT_CLASSES: AccentTheme[] = ['midnight', 'arctic', 'indigo', 'emerald', 'ember', 'rose'];

function applyTheme(isDark: boolean, accent: AccentTheme) {
  const root = document.documentElement;

  // Apply dark/light
  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }

  // Apply accent class (remove all others first)
  ACCENT_CLASSES.forEach(a => root.classList.remove(`accent-${a}`));
  root.classList.add(`accent-${accent}`);
}

// Inline script approach: read stored theme BEFORE React hydrates
// to prevent flash of wrong theme.
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

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const [accentTheme, setAccentState] = useState<AccentTheme>(getInitialAccent);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

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
      applyTheme(isDark, accentTheme);
    };

    updateTheme();

    const listener = () => {
      if (theme === 'system') updateTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme, accentTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try { localStorage.setItem(THEME_KEY, newTheme); } catch { /* noop */ }
  };

  const setAccentTheme = (accent: AccentTheme) => {
    setAccentState(accent);
    try { localStorage.setItem(ACCENT_KEY, accent); } catch { /* noop */ }
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, accentTheme, resolvedTheme, setTheme, setAccentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
