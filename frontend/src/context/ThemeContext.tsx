import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeName, themeLogos } from '@/components/brand/themeLogos';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentTheme =
  | 'midnight'
  | 'arctic'
  | 'indigo'
  | 'emerald'
  | 'ember'
  | 'rose'
  | 'cyan'
  | 'violet'
  | 'gold'
  | 'crimson'
  | 'custom';

export type RadiusStyle = 'sharp' | 'balanced' | 'rounded' | 'soft';
export type DensityStyle = 'compact' | 'comfortable' | 'spacious';
export type SurfaceStyle = 'solid' | 'elevated' | 'glass' | 'forge';
export type BackgroundStyle = 'plain' | 'gradient' | 'forge-glow' | 'forge-grid';
export type SidebarStyle = 'classic' | 'compact' | 'floating' | 'minimal';
export type NavigationStyle = 'soft' | 'accent-bar' | 'filled' | 'minimal';
export type ChartPaletteStyle = 'forge' | 'ocean' | 'forest' | 'aurora' | 'ember' | 'monochrome';
export type MotionStyle = 'full' | 'reduced' | 'minimal' | 'system';
export type ContrastStyle = 'standard' | 'high' | 'maximum';
export type FontScaleStyle = 'sm' | 'default' | 'lg';

export interface ThemeConfig {
  preset: ThemeName;
  mode: ThemeMode;
  accent: AccentTheme;
  customAccentHex?: string;
  surface: SurfaceStyle;
  background: BackgroundStyle;
  radius: RadiusStyle;
  density: DensityStyle;
  sidebar: SidebarStyle;
  navigation: NavigationStyle;
  chartPalette: ChartPaletteStyle;
  motion: MotionStyle;
  contrast: ContrastStyle;
  fontScale: FontScaleStyle;
  enhancedFocus: boolean;
  focusMode: boolean;
}

export interface CustomPreset {
  id: string;
  name: string;
  config: ThemeConfig;
  createdAt: string;
}

export interface ThemeContextType {
  config: ThemeConfig;
  theme: ThemeMode;
  accentTheme: AccentTheme;
  resolvedTheme: 'light' | 'dark';
  currentTheme: ThemeName;
  customPresets: CustomPreset[];

  // Setters
  setTheme: (mode: ThemeMode) => void;
  setThemeName: (name: ThemeName) => void;
  setAccentTheme: (accent: AccentTheme) => void;
  setCustomAccentHex: (hex: string) => void;
  setSurfaceStyle: (surface: SurfaceStyle) => void;
  setBackgroundStyle: (bg: BackgroundStyle) => void;
  setRadiusStyle: (radius: RadiusStyle) => void;
  setDensityStyle: (density: DensityStyle) => void;
  setSidebarStyle: (sidebar: SidebarStyle) => void;
  setNavigationStyle: (nav: NavigationStyle) => void;
  setChartPalette: (palette: ChartPaletteStyle) => void;
  setMotionStyle: (motion: MotionStyle) => void;
  setContrastStyle: (contrast: ContrastStyle) => void;
  setFontScale: (scale: FontScaleStyle) => void;
  setEnhancedFocus: (enabled: boolean) => void;
  setFocusMode: (enabled: boolean) => void;

  // Actions
  toggleTheme: () => void;
  saveCustomPreset: (name: string) => void;
  applyCustomPreset: (preset: CustomPreset) => void;
  deleteCustomPreset: (id: string) => void;
  exportThemeJson: () => string;
  importThemeJson: (jsonStr: string) => { success: boolean; error?: string };
  resetAppearance: () => void;
  resetAll: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_CONFIG_KEY = 'df-theme-studio-config-v2';
const CUSTOM_PRESETS_KEY = 'df-custom-presets-v2';

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  preset: 'forge-dark',
  mode: 'dark',
  accent: 'ember',
  customAccentHex: '#F97316',
  surface: 'elevated',
  background: 'plain',
  radius: 'balanced',
  density: 'comfortable',
  sidebar: 'classic',
  navigation: 'soft',
  chartPalette: 'forge',
  motion: 'full',
  contrast: 'standard',
  fontScale: 'default',
  enhancedFocus: false,
  focusMode: false,
};

function hexToRgb(hex: string): string | null {
  const sanitized = hex.replace('#', '').trim();
  if (sanitized.length === 3) {
    const r = parseInt(sanitized[0] + sanitized[0], 16);
    const g = parseInt(sanitized[1] + sanitized[1], 16);
    const b = parseInt(sanitized[2] + sanitized[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : `${r} ${g} ${b}`;
  }
  if (sanitized.length === 6) {
    const r = parseInt(sanitized.substring(0, 2), 16);
    const g = parseInt(sanitized.substring(2, 4), 16);
    const b = parseInt(sanitized.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : `${r} ${g} ${b}`;
  }
  return null;
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
    /* noop */
  }
}

function applyThemeToDom(config: ThemeConfig, isDark: boolean) {
  const root = document.documentElement;

  // 1. Mode class
  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }

  // 2. Theme Presets (10 presets)
  const allPresets: ThemeName[] = [
    'forge-dark',
    'forge-light',
    'focus-blue',
    'forest',
    'amber-forge',
    'monochrome',
    'midnight',
    'arctic',
    'crimson',
    'ocean',
  ];
  allPresets.forEach((p) => root.classList.remove(`theme-${p}`));
  root.classList.add(`theme-${config.preset}`);

  // 3. Accent theme
  const allAccents: AccentTheme[] = [
    'midnight',
    'arctic',
    'indigo',
    'emerald',
    'ember',
    'rose',
    'cyan',
    'violet',
    'gold',
    'crimson',
    'custom',
  ];
  allAccents.forEach((a) => root.classList.remove(`accent-${a}`));
  root.classList.add(`accent-${config.accent}`);

  // Custom accent injection
  if (config.accent === 'custom' && config.customAccentHex) {
    const rgb = hexToRgb(config.customAccentHex);
    if (rgb) {
      root.style.setProperty('--color-primary', rgb);
      root.style.setProperty('--color-accent', rgb);
      root.style.setProperty('--color-ring', rgb);
      root.style.setProperty('--color-chart-primary', rgb);
    }
  } else {
    root.style.removeProperty('--color-primary');
    root.style.removeProperty('--color-accent');
    root.style.removeProperty('--color-ring');
    root.style.removeProperty('--color-chart-primary');
  }

  // 4. Corner Radius
  ['radius-sharp', 'radius-balanced', 'radius-rounded', 'radius-soft'].forEach((r) =>
    root.classList.remove(r)
  );
  root.classList.add(`radius-${config.radius}`);

  // 5. UI Density
  ['density-compact', 'density-comfortable', 'density-spacious'].forEach((d) =>
    root.classList.remove(d)
  );
  root.classList.add(`density-${config.density}`);

  // 6. Surface Style
  ['surface-solid', 'surface-elevated', 'surface-glass', 'surface-forge'].forEach((s) =>
    root.classList.remove(s)
  );
  root.classList.add(`surface-${config.surface}`);

  // 7. Background Style
  ['bg-style-plain', 'bg-style-gradient', 'bg-style-forge-glow', 'bg-style-forge-grid'].forEach((b) =>
    root.classList.remove(b)
  );
  root.classList.add(`bg-style-${config.background}`);

  // 8. Typography Scale
  ['font-scale-sm', 'font-scale-default', 'font-scale-lg'].forEach((f) =>
    root.classList.remove(f)
  );
  root.classList.add(`font-scale-${config.fontScale}`);

  // 9. Contrast
  ['contrast-standard', 'contrast-high', 'contrast-maximum'].forEach((c) =>
    root.classList.remove(c)
  );
  root.classList.add(`contrast-${config.contrast}`);

  // 10. Motion
  ['motion-full', 'motion-reduced', 'motion-minimal'].forEach((m) =>
    root.classList.remove(m)
  );
  root.classList.add(`motion-${config.motion}`);

  // 11. Enhanced Focus
  if (config.enhancedFocus) {
    root.classList.add('focus-enhanced');
  } else {
    root.classList.remove('focus-enhanced');
  }

  // 12. Favicon
  updateFavicon(config.preset);
}

function loadInitialConfig(): ThemeConfig {
  try {
    const stored = localStorage.getItem(THEME_CONFIG_KEY);
    if (stored) {
      return { ...DEFAULT_THEME_CONFIG, ...JSON.parse(stored) };
    }
  } catch {
    /* fallback */
  }
  return DEFAULT_THEME_CONFIG;
}

function loadInitialPresets(): CustomPreset[] {
  try {
    const stored = localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    /* fallback */
  }
  return [];
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ThemeConfig>(loadInitialConfig);
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(loadInitialPresets);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // React to system preference or config changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const syncTheme = () => {
      let isDark = false;
      if (config.mode === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = config.mode === 'dark';
      }

      setResolvedTheme(isDark ? 'dark' : 'light');
      applyThemeToDom(config, isDark);
    };

    syncTheme();

    const listener = () => {
      if (config.mode === 'system') syncTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [config]);

  const updateConfig = (updater: Partial<ThemeConfig> | ((prev: ThemeConfig) => ThemeConfig)) => {
    setConfig((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem(THEME_CONFIG_KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  const setTheme = (mode: ThemeMode) => {
    updateConfig({ mode });
  };

  const setThemeName = (preset: ThemeName) => {
    // Determine default accent & mode for the chosen preset
    let mode: ThemeMode = 'dark';
    let accent: AccentTheme = 'ember';

    if (preset === 'forge-light') {
      mode = 'light';
      accent = 'ember';
    } else if (preset === 'focus-blue') {
      mode = 'dark';
      accent = 'arctic';
    } else if (preset === 'forest') {
      mode = 'dark';
      accent = 'emerald';
    } else if (preset === 'amber-forge') {
      mode = 'dark';
      accent = 'gold';
    } else if (preset === 'monochrome') {
      mode = 'dark';
      accent = 'midnight';
    } else if (preset === 'midnight') {
      mode = 'dark';
      accent = 'midnight';
    } else if (preset === 'arctic') {
      mode = 'dark';
      accent = 'cyan';
    } else if (preset === 'crimson') {
      mode = 'dark';
      accent = 'crimson';
    } else if (preset === 'ocean') {
      mode = 'dark';
      accent = 'cyan';
    }

    updateConfig({ preset, mode, accent });
  };

  const setAccentTheme = (accent: AccentTheme) => {
    updateConfig({ accent });
  };

  const setCustomAccentHex = (customAccentHex: string) => {
    updateConfig({ accent: 'custom', customAccentHex });
  };

  const setSurfaceStyle = (surface: SurfaceStyle) => updateConfig({ surface });
  const setBackgroundStyle = (background: BackgroundStyle) => updateConfig({ background });
  const setRadiusStyle = (radius: RadiusStyle) => updateConfig({ radius });
  const setDensityStyle = (density: DensityStyle) => updateConfig({ density });
  const setSidebarStyle = (sidebar: SidebarStyle) => updateConfig({ sidebar });
  const setNavigationStyle = (navigation: NavigationStyle) => updateConfig({ navigation });
  const setChartPalette = (chartPalette: ChartPaletteStyle) => updateConfig({ chartPalette });
  const setMotionStyle = (motion: MotionStyle) => updateConfig({ motion });
  const setContrastStyle = (contrast: ContrastStyle) => updateConfig({ contrast });
  const setFontScale = (fontScale: FontScaleStyle) => updateConfig({ fontScale });
  const setEnhancedFocus = (enhancedFocus: boolean) => updateConfig({ enhancedFocus });
  const setFocusMode = (focusMode: boolean) => updateConfig({ focusMode });

  const toggleTheme = () => {
    const nextMode = config.mode === 'dark' ? 'light' : 'dark';
    setTheme(nextMode);
  };

  const saveCustomPreset = (name: string) => {
    const newPreset: CustomPreset = {
      id: `custom-${Date.now()}`,
      name: name.trim() || 'Custom Preset',
      config: { ...config },
      createdAt: new Date().toISOString(),
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    try {
      localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated));
    } catch {
      /* noop */
    }
  };

  const applyCustomPreset = (preset: CustomPreset) => {
    updateConfig(preset.config);
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated));
    } catch {
      /* noop */
    }
  };

  const exportThemeJson = (): string => {
    const payload = {
      schemaVersion: 1,
      appName: 'DailyForge',
      name: 'DailyForge Custom Theme',
      exportedAt: new Date().toISOString(),
      config,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importThemeJson = (jsonStr: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid JSON payload structure.' };
      }
      if (parsed.schemaVersion !== 1 && !parsed.config) {
        return { success: false, error: 'Unsupported theme schema version.' };
      }
      const importedConfig = parsed.config || parsed;
      updateConfig({ ...DEFAULT_THEME_CONFIG, ...importedConfig });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to parse JSON file.' };
    }
  };

  const resetAppearance = () => {
    updateConfig({
      preset: 'forge-dark',
      mode: 'dark',
      accent: 'ember',
      surface: 'elevated',
      background: 'plain',
      radius: 'balanced',
      density: 'comfortable',
      sidebar: 'classic',
      navigation: 'soft',
      chartPalette: 'forge',
    });
  };

  const resetAll = () => {
    updateConfig(DEFAULT_THEME_CONFIG);
  };

  return (
    <ThemeContext.Provider
      value={{
        config,
        theme: config.mode,
        accentTheme: config.accent,
        resolvedTheme,
        currentTheme: config.preset,
        customPresets,
        setTheme,
        setThemeName,
        setAccentTheme,
        setCustomAccentHex,
        setSurfaceStyle,
        setBackgroundStyle,
        setRadiusStyle,
        setDensityStyle,
        setSidebarStyle,
        setNavigationStyle,
        setChartPalette,
        setMotionStyle,
        setContrastStyle,
        setFontScale,
        setEnhancedFocus,
        setFocusMode,
        toggleTheme,
        saveCustomPreset,
        applyCustomPreset,
        deleteCustomPreset,
        exportThemeJson,
        importThemeJson,
        resetAppearance,
        resetAll,
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
