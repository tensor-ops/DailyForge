import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ThemeName, themeLogos } from '@/components/brand/themeLogos';
import { ThemeLogo } from '@/components/brand/ThemeLogo';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export const PresetsGrid: React.FC = () => {
  const { currentTheme, setThemeName } = useTheme();

  const presets = Object.keys(themeLogos) as ThemeName[];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Theme Presets (10 Curated Profiles)
          </h4>
          <p className="text-[11px] text-muted-foreground">
            Complete visual personalities with tailored logos, circadian contrasts, and accents
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {presets.map((presetKey) => {
          const config = themeLogos[presetKey];
          const isSelected = currentTheme === presetKey;

          return (
            <button
              key={presetKey}
              type="button"
              onClick={() => setThemeName(presetKey)}
              className={cn(
                'group relative p-4 rounded-xl border flex flex-col justify-between gap-3 text-left transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                  : 'border-border bg-surface-elevated hover:border-border-strong hover:bg-card-hover'
              )}
            >
              {/* Top Bar: Brand Logo + Selection Check */}
              <div className="flex items-center justify-between w-full">
                <ThemeLogo variant="full" theme={presetKey} size="sm" />
                <div
                  className={cn(
                    'h-5 w-5 rounded-full flex items-center justify-center border transition-all shrink-0 ml-2',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/60 bg-surface group-hover:border-border'
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                </div>
              </div>

              {/* Title & Palette Summary */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground block">{config.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground block line-clamp-1 mt-0.5">
                  {config.paletteDescription}
                </span>
              </div>

              {/* Color Swatch Dots */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-border/40">
                <span
                  className="h-3 w-3 rounded-full border border-white/10 shrink-0 shadow-xs"
                  style={{ backgroundColor: config.previewColors.primary }}
                  title={`Primary: ${config.previewColors.primary}`}
                />
                <span
                  className="h-3 w-3 rounded-full border border-white/10 shrink-0 shadow-xs"
                  style={{ backgroundColor: config.previewColors.secondary }}
                  title={`Accent: ${config.previewColors.secondary}`}
                />
                <span
                  className="h-3 w-3 rounded-full border border-white/20 shrink-0 shadow-xs"
                  style={{ backgroundColor: config.previewColors.background }}
                  title={`Background: ${config.previewColors.background}`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
