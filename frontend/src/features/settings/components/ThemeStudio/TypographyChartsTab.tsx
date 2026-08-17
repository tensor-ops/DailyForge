import React from 'react';
import { useTheme, ChartPaletteStyle, FontScaleStyle } from '@/context/ThemeContext';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ChartPaletteOption {
  id: ChartPaletteStyle;
  name: string;
  colors: string[];
  desc: string;
}

const CHART_PALETTES: ChartPaletteOption[] = [
  {
    id: 'forge',
    name: 'Forge Energy',
    colors: ['#F97316', '#3B82F6', '#06B6D4', '#EAB308'],
    desc: 'Signature warm orange, electric blue, and cyan contrast',
  },
  {
    id: 'ocean',
    name: 'Oceanic Currents',
    colors: ['#0284C7', '#06B6D4', '#6366F1', '#38BDF8'],
    desc: 'Deep marine blues, aquamarine, and royal indigo',
  },
  {
    id: 'forest',
    name: 'Forest Canopy',
    colors: ['#10B981', '#14B8A6', '#84CC16', '#059669'],
    desc: 'Emerald green, mint teal, and radiant lime growth tones',
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    colors: ['#8B5CF6', '#D946EF', '#06B6D4', '#EC4899'],
    desc: 'Vivid violet, magenta, and cyan polar transitions',
  },
  {
    id: 'ember',
    name: 'Ember Hearth',
    colors: ['#F59E0B', '#EA580C', '#E11D48', '#FB923C'],
    desc: 'Golden amber, molten orange, and radiant rose',
  },
  {
    id: 'monochrome',
    name: 'Monochrome Slate',
    colors: ['#F1F5F9', '#94A3B8', '#64748B', '#334155'],
    desc: 'High-clarity grayscale for pure data readability',
  },
];

export const TypographyChartsTab: React.FC = () => {
  const { config, setFontScale, setChartPalette } = useTheme();

  return (
    <div className="space-y-6 text-left">
      {/* Typography Scale */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
          Typography Scale
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
          {([
            { id: 'sm' as FontScaleStyle, name: 'Compact (13px)', desc: 'Higher information density on compact screens' },
            { id: 'default' as FontScaleStyle, name: 'Default (14px)', desc: 'Standard balanced typography scale' },
            { id: 'lg' as FontScaleStyle, name: 'Large (15px)', desc: 'Enhanced legibility and enlarged comfortable text' },
          ]).map((scale) => (
            <button
              key={scale.id}
              type="button"
              onClick={() => setFontScale(scale.id)}
              className={cn(
                'p-3.5 rounded-xl border flex flex-col justify-between gap-1 text-left transition-all cursor-pointer select-none',
                config.fontScale === scale.id
                  ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface-elevated hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-xs font-extrabold text-foreground">{scale.name}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{scale.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Data Visualization Themes */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
              Data Visualization Color Palettes
            </label>
          </div>
          <span className="text-[10px] text-muted-foreground">
            Controls performance charts, heatmaps, and habit trends
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CHART_PALETTES.map((palette) => {
            const isSelected = config.chartPalette === palette.id;

            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => setChartPalette(palette.id)}
                className={cn(
                  'p-3.5 rounded-xl border flex flex-col justify-between gap-3 text-left transition-all cursor-pointer select-none',
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30'
                    : 'border-border bg-surface-elevated hover:border-border-strong hover:bg-muted'
                )}
              >
                <div>
                  <span className="text-xs font-extrabold text-foreground block">
                    {palette.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground block leading-tight mt-0.5">
                    {palette.desc}
                  </span>
                </div>

                {/* Color Swatch Bars */}
                <div className="flex items-center gap-1.5 h-3 rounded-lg overflow-hidden p-0.5 bg-surface-sunken border border-border/60">
                  {palette.colors.map((c, i) => (
                    <div
                      key={i}
                      className="flex-1 h-full rounded-sm shadow-2xs"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
