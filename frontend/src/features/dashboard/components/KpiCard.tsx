import React from 'react';
import { cn } from '@/utils/cn';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
  value: string | number;
  label: string;
  delta?: string;
  deltaPositive?: boolean;
  subtext?: string;
  className?: string;
  accent?: 'blue' | 'orange' | 'emerald' | 'purple';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  icon: Icon,
  iconBgClass,
  iconColorClass,
  value,
  label,
  delta,
  deltaPositive = true,
  subtext,
  className,
  accent = 'blue',
}) => {
  const accentBorderClass = {
    blue: 'hover:border-primary/40',
    orange: 'hover:border-warning/40',
    emerald: 'hover:border-success/40',
    purple: 'hover:border-ai/40',
  }[accent];

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200',
        accentBorderClass,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', iconBgClass)}>
          <Icon className={cn('h-4.5 w-4.5', iconColorClass)} size={18} />
        </div>
        {delta && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
              deltaPositive
                ? 'bg-success/10 text-success'
                : 'bg-danger/10 text-danger'
            )}
          >
            {deltaPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {delta}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-extrabold text-foreground tracking-tight leading-none">
          {value}
        </div>
        <div className="text-xs font-medium text-muted-foreground mt-1">{label}</div>
        {subtext && (
          <div className="text-[11px] text-muted-foreground/70 mt-0.5">{subtext}</div>
        )}
      </div>
    </div>
  );
};
