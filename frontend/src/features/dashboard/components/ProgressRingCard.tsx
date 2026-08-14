import React, { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';

interface ProgressRingCardProps {
  percentage: number;
  completed: number;
  total: number;
  className?: string;
  isLoading?: boolean;
}

export const ProgressRingCard: React.FC<ProgressRingCardProps> = ({
  percentage,
  completed,
  total,
  className,
  isLoading = false,
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.transition = 'stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1)';
      circleRef.current.style.strokeDashoffset = String(offset);
    }
  }, [offset]);

  if (isLoading) {
    return (
      <div className={cn('bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-4', className)}>
        <div className="h-36 w-36 rounded-full bg-muted/30 animate-pulse" />
        <div className="h-4 w-24 rounded bg-muted/30 animate-pulse" />
      </div>
    );
  }

  const remaining = total - completed;
  const statusText =
    percentage === 100
      ? 'All done! 🎉'
      : percentage >= 75
      ? 'Strong progress'
      : percentage >= 50
      ? 'Keep going'
      : 'Get started';

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-4',
        className
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Today's Progress</h3>
          <p className="text-xs text-muted-foreground">{statusText}</p>
        </div>
      </div>

      {/* Ring */}
      <div className="relative flex items-center justify-center">
        <svg width="144" height="144" viewBox="0 0 144 144" fill="none" className="-rotate-90">
          {/* Track */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted/60"
            fill="transparent"
          />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx="72"
            cy="72"
            r={radius}
            stroke="url(#ringGrad)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference} // starts at 0, animates
            strokeLinecap="round"
            fill="transparent"
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-foreground tracking-tight leading-none">
            {percentage}%
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 font-medium">
            complete
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 w-full gap-3">
        <div className="bg-muted/40 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-success">{completed}</div>
          <div className="text-[11px] text-muted-foreground font-medium">Completed</div>
        </div>
        <div className="bg-muted/40 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-foreground">{remaining}</div>
          <div className="text-[11px] text-muted-foreground font-medium">Remaining</div>
        </div>
      </div>
    </div>
  );
};
