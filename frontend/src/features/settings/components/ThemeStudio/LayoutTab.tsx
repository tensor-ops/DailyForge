import React from 'react';
import {
  useTheme,
  RadiusStyle,
  DensityStyle,
  SidebarStyle,
  NavigationStyle,
} from '@/context/ThemeContext';
import { cn } from '@/utils/cn';

export const LayoutTab: React.FC = () => {
  const {
    config,
    setRadiusStyle,
    setDensityStyle,
    setSidebarStyle,
    setNavigationStyle,
  } = useTheme();

  return (
    <div className="space-y-6 text-left">
      {/* Corner Radius */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
          Corner Radius
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
          {([
            { id: 'sharp' as RadiusStyle, name: 'Sharp', radius: '6px', desc: 'Technical & compact' },
            { id: 'balanced' as RadiusStyle, name: 'Balanced', radius: '12px', desc: 'Modern default' },
            { id: 'rounded' as RadiusStyle, name: 'Rounded', radius: '16px', desc: 'Smooth & friendly' },
            { id: 'soft' as RadiusStyle, name: 'Soft Curve', radius: '22px', desc: 'Gentle organic' },
          ]).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRadiusStyle(r.id)}
              className={cn(
                'p-3.5 rounded-xl border flex flex-col justify-between gap-2 text-left transition-all cursor-pointer select-none',
                config.radius === r.id
                  ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface-elevated hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-foreground">{r.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground font-bold">
                  {r.radius}
                </span>
              </div>
              {/* Radius shape preview swatch */}
              <div
                className="h-5 w-full border border-primary/40 bg-primary/20"
                style={{
                  borderRadius: r.radius,
                }}
              />
              <span className="text-[10px] text-muted-foreground leading-tight">{r.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* UI Density */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
          UI Density
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
          {([
            {
              id: 'compact' as DensityStyle,
              name: 'Compact',
              desc: 'High data density, tight margins, ideal for laptop screens & dense tables',
            },
            {
              id: 'comfortable' as DensityStyle,
              name: 'Comfortable',
              desc: 'Standard balanced spacing, optimal visual comfort for daily routine tracking',
            },
            {
              id: 'spacious' as DensityStyle,
              name: 'Spacious',
              desc: 'Generous breathing room, large touch targets, ideal for high-res monitors',
            },
          ]).map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDensityStyle(d.id)}
              className={cn(
                'p-3.5 rounded-xl border flex flex-col justify-between gap-1.5 text-left transition-all cursor-pointer select-none',
                config.density === d.id
                  ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface-elevated hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-xs font-extrabold text-foreground">{d.name}</span>
              <span className="text-[11px] text-muted-foreground leading-snug">{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar Appearance */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
          Sidebar Appearance
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
          {([
            { id: 'classic' as SidebarStyle, name: 'Classic', desc: 'Full persistent sidebar' },
            { id: 'compact' as SidebarStyle, name: 'Compact', desc: 'Icon-centric rail' },
            { id: 'floating' as SidebarStyle, name: 'Floating', desc: 'Detached elevated island' },
            { id: 'minimal' as SidebarStyle, name: 'Minimal', desc: 'Borderless minimal tone' },
          ]).map((sb) => (
            <button
              key={sb.id}
              type="button"
              onClick={() => setSidebarStyle(sb.id)}
              className={cn(
                'p-3 rounded-xl border flex flex-col justify-between gap-1 text-left transition-all cursor-pointer select-none',
                config.sidebar === sb.id
                  ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface-elevated hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-xs font-extrabold text-foreground">{sb.name}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{sb.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Selection Indicator */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
          Navigation Selection Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
          {([
            { id: 'soft' as NavigationStyle, name: 'Soft Highlight', desc: 'Tinted background glow' },
            { id: 'accent-bar' as NavigationStyle, name: 'Accent Bar', desc: 'Vertical left border indicator' },
            { id: 'filled' as NavigationStyle, name: 'Filled Solid', desc: 'Vibrant solid accent block' },
            { id: 'minimal' as NavigationStyle, name: 'Minimal Text', desc: 'Clean high-contrast bold text' },
          ]).map((nav) => (
            <button
              key={nav.id}
              type="button"
              onClick={() => setNavigationStyle(nav.id)}
              className={cn(
                'p-3 rounded-xl border flex flex-col justify-between gap-1 text-left transition-all cursor-pointer select-none',
                config.navigation === nav.id
                  ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface-elevated hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-xs font-extrabold text-foreground">{nav.name}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{nav.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
