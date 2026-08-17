import React, { useState } from 'react';
import { useTheme, AccentTheme, SurfaceStyle, BackgroundStyle } from '@/context/ThemeContext';
import { Moon, Sun, Laptop, Check, Pipette } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AccentOption {
  id: AccentTheme;
  label: string;
  darkColor: string;
  lightColor: string;
  description: string;
}

const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'midnight', label: 'Midnight', darkColor: '#3B82F6', lightColor: '#2563EB', description: 'Deep electric blue' },
  { id: 'arctic', label: 'Arctic', darkColor: '#06B6D4', lightColor: '#0891B2', description: 'Cool cyan ice tones' },
  { id: 'indigo', label: 'Royal Indigo', darkColor: '#6366F1', lightColor: '#4F46E5', description: 'Electric purple-blue' },
  { id: 'emerald', label: 'Emerald', darkColor: '#10B981', lightColor: '#059669', description: 'Growth mint green' },
  { id: 'ember', label: 'Ember', darkColor: '#F97316', lightColor: '#EA580C', description: 'Warm energy orange' },
  { id: 'rose', label: 'Rose', darkColor: '#E11D48', lightColor: '#BE123C', description: 'Radiant crimson-pink' },
  { id: 'cyan', label: 'Cyan Focus', darkColor: '#00C2FF', lightColor: '#0284C7', description: 'Luminous cyan accent' },
  { id: 'violet', label: 'Violet', darkColor: '#8B5CF6', lightColor: '#7C3AED', description: 'Deep purple focus' },
  { id: 'gold', label: 'Gold Amber', darkColor: '#F59E0B', lightColor: '#D97706', description: 'Golden celebration tone' },
  { id: 'crimson', label: 'Crimson', darkColor: '#EF4444', lightColor: '#DC2626', description: 'High-intensity ruby' },
];

export const AppearanceTab: React.FC = () => {
  const {
    config,
    theme,
    setTheme,
    accentTheme,
    setAccentTheme,
    setCustomAccentHex,
    resolvedTheme,
    setSurfaceStyle,
    setBackgroundStyle,
  } = useTheme();

  const [hexInput, setHexInput] = useState(config.customAccentHex || '#F97316');

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      setCustomAccentHex(val);
    }
  };

  const handleColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    setCustomAccentHex(val);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Base Mode */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
          Base Mode
        </label>
        <div className="grid grid-cols-3 gap-3 text-xs font-bold">
          {([
            { value: 'dark' as const, label: 'Dark Mode', Icon: Moon, desc: 'Deep focus low-light environment' },
            { value: 'light' as const, label: 'Light Mode', Icon: Sun, desc: 'High-clarity daylight contrast' },
            { value: 'system' as const, label: 'System', Icon: Laptop, desc: 'Syncs with OS preference' },
          ]).map(({ value, label, Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                'p-3.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer select-none',
                theme === value
                  ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface-elevated hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="text-xs font-extrabold">{label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                {desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color Palette */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
            Accent Color Palette
          </label>
          <span className="text-[10px] text-muted-foreground">
            Applies to primary buttons, active states, progress, and highlights
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {ACCENT_OPTIONS.map((accent) => {
            const isSelected = accentTheme === accent.id;
            const color = resolvedTheme === 'dark' ? accent.darkColor : accent.lightColor;
            return (
              <button
                key={accent.id}
                type="button"
                onClick={() => setAccentTheme(accent.id)}
                title={`${accent.label} — ${accent.description}`}
                className={cn(
                  'group relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer text-left',
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30'
                    : 'border-border bg-surface-elevated hover:border-border-strong hover:bg-muted'
                )}
              >
                {/* Swatch circle */}
                <div
                  className="h-6 w-6 rounded-full border flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: color,
                    borderColor: isSelected ? color : 'transparent',
                  }}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
                <div className="min-w-0">
                  <span
                    className={cn(
                      'text-xs font-bold block truncate leading-tight',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {accent.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Accent Color Picker */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-surface-elevated flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Pipette className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">
                Custom HEX Accent
              </span>
              <span className="text-[10px] text-muted-foreground">
                Define an exact brand or personal HEX color code
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={hexInput.startsWith('#') ? hexInput : '#F97316'}
              onChange={handleColorPicker}
              className="h-8 w-8 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
            />
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              placeholder="#F97316"
              className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold bg-input border border-input-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setCustomAccentHex(hexInput)}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer',
                accentTheme === 'custom'
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {accentTheme === 'custom' ? 'Applied' : 'Apply'}
            </button>
          </div>
        </div>
      </div>

      {/* Surface Style */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
          Surface Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
          {([
            { id: 'solid' as SurfaceStyle, name: 'Solid Flat', desc: 'Crisp flat surfaces' },
            { id: 'elevated' as SurfaceStyle, name: 'Elevated Card', desc: 'Subtle ambient lift' },
            { id: 'glass' as SurfaceStyle, name: 'Glass Blur', desc: 'Translucent backdrops' },
            { id: 'forge' as SurfaceStyle, name: 'Forge Layered', desc: 'Glow borders & depth' },
          ]).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSurfaceStyle(s.id)}
              className={cn(
                'p-3 rounded-xl border flex flex-col justify-between gap-1 text-left transition-all cursor-pointer select-none',
                config.surface === s.id
                  ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface-elevated hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-xs font-extrabold text-foreground">{s.name}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Background Visual Effects */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
          Background Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
          {([
            { id: 'plain' as BackgroundStyle, name: 'Plain Minimal', desc: 'Clean distraction-free' },
            { id: 'gradient' as BackgroundStyle, name: 'Radial Gradient', desc: 'Soft top aura' },
            { id: 'forge-glow' as BackgroundStyle, name: 'Forge Ambient Glow', desc: 'Dynamic dual gradient' },
            { id: 'forge-grid' as BackgroundStyle, name: 'Technical Grid', desc: 'Subtle 32px mesh' },
          ]).map((bg) => (
            <button
              key={bg.id}
              type="button"
              onClick={() => setBackgroundStyle(bg.id)}
              className={cn(
                'p-3 rounded-xl border flex flex-col justify-between gap-1 text-left transition-all cursor-pointer select-none',
                config.background === bg.id
                  ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface-elevated hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-xs font-extrabold text-foreground">{bg.name}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{bg.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
