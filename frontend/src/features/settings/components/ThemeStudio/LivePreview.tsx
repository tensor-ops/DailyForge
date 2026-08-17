import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ThemeLogo } from '@/components/brand/ThemeLogo';
import { Flame, CheckCircle2, Trophy, BarChart2, Bell, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

export const LivePreview: React.FC = () => {
  const { config, resolvedTheme } = useTheme();

  // Helper chart color map
  const getChartColor = (index: number) => {
    switch (config.chartPalette) {
      case 'ocean':
        return index === 0 ? '#2563EB' : index === 1 ? '#06B6D4' : '#6366F1';
      case 'forest':
        return index === 0 ? '#10B981' : index === 1 ? '#14B8A6' : '#84CC16';
      case 'aurora':
        return index === 0 ? '#8B5CF6' : index === 1 ? '#D946EF' : '#06B6D4';
      case 'ember':
        return index === 0 ? '#F59E0B' : index === 1 ? '#EA580C' : '#E11D48';
      case 'monochrome':
        return index === 0 ? '#E2E8F0' : index === 1 ? '#94A3B8' : '#64748B';
      case 'forge':
      default:
        return index === 0 ? '#F97316' : index === 1 ? '#3B82F6' : '#06B6D4';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Live Workspace Preview
          </h4>
        </div>
        <span className="text-[10px] text-muted-foreground font-semibold">
          Updates in real-time as you customize tokens
        </span>
      </div>

      {/* Simulated App Shell Card */}
      <div
        className={cn(
          'relative rounded-2xl border border-border p-3 sm:p-4 bg-background text-foreground shadow-card overflow-hidden transition-all duration-300',
          config.background === 'gradient' && 'bg-style-gradient',
          config.background === 'forge-glow' && 'bg-style-forge-glow',
          config.background === 'forge-grid' && 'bg-style-forge-grid'
        )}
      >
        <div className="grid grid-cols-12 gap-3 sm:gap-4">
          {/* Mini Sidebar */}
          <div
            className={cn(
              'col-span-3 sm:col-span-3 rounded-xl border border-border/80 p-2 sm:p-3 flex flex-col justify-between transition-all bg-surface-elevated',
              config.sidebar === 'compact' && 'items-center',
              config.sidebar === 'floating' && 'shadow-elevated border-primary/20',
              config.sidebar === 'minimal' && 'border-transparent bg-transparent'
            )}
          >
            <div className="space-y-3">
              {/* Mini Brand Logo */}
              <div className="flex items-center gap-1.5 pb-2 border-b border-border/40">
                <ThemeLogo variant={config.sidebar === 'compact' ? 'icon' : 'full'} size="xs" />
              </div>

              {/* Navigation Items */}
              <div className="space-y-1 text-[11px] font-bold">
                <div
                  className={cn(
                    'p-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer select-none',
                    config.navigation === 'soft' && 'bg-primary/10 text-primary',
                    config.navigation === 'accent-bar' && 'border-l-2 border-primary pl-2 bg-surface-sunken text-primary',
                    config.navigation === 'filled' && 'bg-primary text-white shadow-xs',
                    config.navigation === 'minimal' && 'text-primary font-black'
                  )}
                >
                  <BarChart2 className="h-3.5 w-3.5 shrink-0" />
                  {config.sidebar !== 'compact' && <span>Overview</span>}
                </div>

                <div className="p-1.5 rounded-lg flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  {config.sidebar !== 'compact' && <span>Habits</span>}
                </div>

                <div className="p-1.5 rounded-lg flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Trophy className="h-3.5 w-3.5 shrink-0" />
                  {config.sidebar !== 'compact' && <span>Goals</span>}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
              {config.sidebar !== 'compact' && <span>Parth A.</span>}
              <div className="h-4 w-4 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[9px] font-black text-primary">
                PA
              </div>
            </div>
          </div>

          {/* Mini Dashboard Workspace */}
          <div className="col-span-9 sm:col-span-9 space-y-3">
            {/* Top Bar Preview */}
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div>
                <span className="text-xs sm:text-sm font-extrabold text-foreground block leading-tight">
                  Daily Execution Cockpit
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {config.preset.replace('-', ' ').toUpperCase()} · {resolvedTheme.toUpperCase()} MODE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary text-white shadow-xs"
                >
                  + Add Habit
                </button>
                <div className="p-1 rounded-lg bg-surface-elevated border border-border text-muted-foreground">
                  <Bell className="h-3 w-3" />
                </div>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-3 gap-2">
              {/* Forge Score Card */}
              <div className="p-2 sm:p-2.5 rounded-xl border border-border/80 bg-surface-elevated space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase block">
                  Forge Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm sm:text-base font-mono font-black text-primary">
                    842
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold">+14</span>
                </div>
              </div>

              {/* Streak Card */}
              <div className="p-2 sm:p-2.5 rounded-xl border border-border/80 bg-surface-elevated space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase block">
                  Current Streak
                </span>
                <div className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-warning fill-warning" />
                  <span className="text-sm sm:text-base font-mono font-black text-foreground">
                    18 Days
                  </span>
                </div>
              </div>

              {/* Completion Card */}
              <div className="p-2 sm:p-2.5 rounded-xl border border-border/80 bg-surface-elevated space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase block">
                  Today's Rate
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm sm:text-base font-mono font-black text-foreground">
                    87%
                  </span>
                  <span className="text-[8px] text-muted-foreground">4 / 5</span>
                </div>
              </div>
            </div>

            {/* Interactive Simulation Strip (Chart Bars + Habit Checkbox) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Mini Chart Preview */}
              <div className="p-2.5 rounded-xl border border-border/80 bg-surface-elevated space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-muted-foreground">Performance Palette</span>
                  <span className="text-primary uppercase text-[9px]">{config.chartPalette}</span>
                </div>
                <div className="flex items-end gap-1.5 h-10 pt-1">
                  {[45, 75, 60, 90, 80, 95, 88].map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${val}%`,
                        backgroundColor: getChartColor(idx % 3),
                        opacity: idx === 6 ? 1 : 0.75,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Mini Habit Execution Strip */}
              <div className="p-2.5 rounded-xl border border-border/80 bg-surface-elevated flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground">Next Routine</span>
                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    MORNING
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-surface-sunken border border-border/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-4 w-4 rounded-md bg-primary flex items-center justify-center text-white shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <span className="text-[11px] font-bold text-foreground truncate">
                      Deep Focus Blocks
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                    45m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
