import React from 'react';
import { ConsistencyDay } from './heatmap.types';
import { Flame, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HeatmapTooltipProps {
  day: ConsistencyDay;
  x: number;
  y: number;
  streakCount?: number;
}

export const HeatmapTooltip: React.FC<HeatmapTooltipProps> = ({ day, x, y, streakCount }) => {
  const formattedDate = day.dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const getStatusBadge = () => {
    if (day.isFuture) {
      return { text: 'Upcoming', icon: Sparkles, color: 'text-muted-foreground bg-muted/40' };
    }
    if (day.scheduled === 0) {
      return { text: 'No habits scheduled', icon: Sparkles, color: 'text-muted-foreground bg-muted/40' };
    }
    if (day.percentage === 100) {
      return { text: 'Perfect day', icon: Sparkles, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    }
    if (day.percentage >= 75) {
      return { text: 'Strong execution', icon: Flame, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    }
    if (day.percentage >= 50) {
      return { text: 'Solid progress', icon: CheckCircle2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    }
    if (day.percentage > 0) {
      return { text: 'Needs attention', icon: AlertCircle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    }
    return { text: 'Missed day', icon: AlertCircle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  const badge = getStatusBadge();
  const Icon = badge.icon;

  return (
    <div
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 pb-2 transition-opacity duration-150 motion-safe:animate-fade-in"
    >
      <div className="bg-surface-elevated/95 backdrop-blur-md border border-border/80 shadow-popover rounded-xl p-3 text-xs w-56 text-left space-y-2">
        {/* Header: Date + Today badge */}
        <div className="flex items-center justify-between gap-1 border-b border-border/40 pb-1.5">
          <span className="font-bold text-foreground text-[11px] truncate">{formattedDate}</span>
          {day.isToday && (
            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-extrabold uppercase tracking-wider shrink-0">
              Today
            </span>
          )}
        </div>

        {/* Metric info */}
        {day.isFuture ? (
          <p className="text-[11px] text-muted-foreground italic">Future date</p>
        ) : day.scheduled === 0 ? (
          <p className="text-[11px] text-muted-foreground">No active habits scheduled.</p>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-medium">
                {day.completed} / {day.scheduled} habits completed
              </span>
              <span className="font-extrabold text-foreground">{day.percentage}%</span>
            </div>

            {/* Status indicator pill */}
            <div
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
                badge.color
              )}
            >
              <Icon className="h-3 w-3 shrink-0" />
              <span>{badge.text}</span>
            </div>
          </div>
        )}

        {/* Streak indicator if active */}
        {!day.isFuture && day.isCurrentStreak && streakCount && streakCount > 0 && (
          <div className="pt-1 border-t border-border/30 flex items-center gap-1 text-[10px] text-orange-400 font-semibold">
            <Flame className="h-3 w-3 text-orange-500" />
            <span>Part of {streakCount}-day streak</span>
          </div>
        )}
      </div>
    </div>
  );
};
