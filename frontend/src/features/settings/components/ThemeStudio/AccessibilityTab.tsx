import React from 'react';
import { useTheme, MotionStyle, ContrastStyle } from '@/context/ThemeContext';
import { Eye, ZapOff, Sparkles, Target } from 'lucide-react';
import { cn } from '@/utils/cn';

export const AccessibilityTab: React.FC = () => {
  const {
    config,
    setMotionStyle,
    setContrastStyle,
    setEnhancedFocus,
    setFocusMode,
  } = useTheme();

  return (
    <div className="space-y-6 text-left">
      {/* Motion & Animations */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
          Motion &amp; Animations
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
          {([
            { id: 'full' as MotionStyle, name: 'Full Animation', Icon: Sparkles, desc: 'Fluid transitions & interactive feedback' },
            { id: 'reduced' as MotionStyle, name: 'Reduced Motion', Icon: ZapOff, desc: '100ms micro-transitions, removes bounces' },
            { id: 'minimal' as MotionStyle, name: 'Instant / Minimal', Icon: Eye, desc: 'Zero animation delays for maximum speed' },
          ]).map(({ id, name, Icon, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMotionStyle(id)}
              className={cn(
                'p-3.5 rounded-xl border flex flex-col justify-between gap-1.5 text-left transition-all cursor-pointer select-none',
                config.motion === id
                  ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface-elevated hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-xs font-extrabold text-foreground">{name}</span>
              </div>
              <span className="text-[10px] text-muted-foreground leading-tight">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contrast Levels */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
          Contrast &amp; Legibility
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
          {([
            { id: 'standard' as ContrastStyle, name: 'Standard Contrast', desc: 'Balanced DailyForge signature palette' },
            { id: 'high' as ContrastStyle, name: 'High Contrast', desc: 'Elevated border darkness and bolder headings' },
            { id: 'maximum' as ContrastStyle, name: 'Maximum Accessibility', desc: 'WCAG AAA compliant border & foreground contrasts' },
          ]).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setContrastStyle(c.id)}
              className={cn(
                'p-3.5 rounded-xl border flex flex-col justify-between gap-1.5 text-left transition-all cursor-pointer select-none',
                config.contrast === c.id
                  ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30'
                  : 'border-border bg-surface-elevated hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-xs font-extrabold text-foreground">{c.name}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{c.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility Flags */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <label className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">
          Enhanced Accessibility Features
        </label>

        {/* Enhanced Focus Rings */}
        <div className="flex items-center justify-between p-3.5 bg-surface-elevated border border-border rounded-xl gap-4">
          <div>
            <span className="text-xs text-foreground block font-bold">
              Enhanced Focus Indicators
            </span>
            <span className="text-[10px] text-muted-foreground">
              Displays prominent 2px high-visibility focus rings around all focused interactive inputs and buttons.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEnhancedFocus(!config.enhancedFocus)}
            className={cn(
              'px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer text-[10px] uppercase whitespace-nowrap shrink-0',
              config.enhancedFocus
                ? 'bg-primary border-primary text-white shadow-xs'
                : 'bg-surface border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {config.enhancedFocus ? 'ENABLED' : 'OFF'}
          </button>
        </div>

        {/* Focus Mode Workspace */}
        <div className="flex items-center justify-between p-3.5 bg-surface-elevated border border-border rounded-xl gap-4">
          <div className="flex items-start gap-2.5">
            <Target className="h-4.5 w-4.5 text-primary mt-0.5" />
            <div>
              <span className="text-xs text-foreground block font-bold">
                Distraction-Reduced Focus Workspace
              </span>
              <span className="text-[10px] text-muted-foreground">
                Minimizes peripheral visual effects, streamlines notifications, and highlights only current active time blocks.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFocusMode(!config.focusMode)}
            className={cn(
              'px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer text-[10px] uppercase whitespace-nowrap shrink-0',
              config.focusMode
                ? 'bg-primary border-primary text-white shadow-xs'
                : 'bg-surface border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {config.focusMode ? 'ACTIVE' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};
