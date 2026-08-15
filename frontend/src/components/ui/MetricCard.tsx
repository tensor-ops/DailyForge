import React from 'react';
import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon?: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accent?: 'blue' | 'orange' | 'green' | 'cyan';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendPositive = true,
  accent = 'blue',
  className,
}) => {
  const borderAccents = {
    blue: 'hover:border-primary/45 focus-within:border-primary/45',
    orange: 'hover:border-warning/45 focus-within:border-warning/45',
    green: 'hover:border-success/45 focus-within:border-success/45',
    cyan: 'hover:border-cyan-500/45 focus-within:border-cyan-500/45',
  };

  const iconColors = {
    blue: 'text-primary bg-primary/10',
    orange: 'text-warning bg-warning/10',
    green: 'text-success bg-success/10',
    cyan: 'text-cyan-400 bg-cyan-400/10',
  };

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-card p-4 flex items-center justify-between gap-4 transition-all duration-200 shadow-sm hover:bg-surface-elevated',
        borderAccents[accent],
        className
      )}
    >
      <div className="space-y-1.5 min-w-0">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</span>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-extrabold text-foreground tracking-tight leading-none">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5',
                trendPositive
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              )}
            >
              {trend}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/80 font-medium truncate">{subtext}</p>
      </div>

      {Icon && (
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/5', iconColors[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};
