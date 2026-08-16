import React from 'react';
import { GoalStatus } from '@/types/goal';
import { cn } from '@/utils/cn';

interface GoalStatusBadgeProps {
  status: GoalStatus;
  className?: string;
}

export const GoalStatusBadge: React.FC<GoalStatusBadgeProps> = ({ status, className }) => {
  const config = {
    AHEAD: {
      label: 'Ahead',
      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    ON_TRACK: {
      label: 'On Track',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-400',
    },
    AT_RISK: {
      label: 'At Risk',
      className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400 animate-pulse',
    },
    BEHIND: {
      label: 'Behind',
      className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400',
    },
    OVERDUE: {
      label: 'Overdue',
      className: 'bg-danger/20 text-danger border-danger/40',
      dot: 'bg-danger animate-ping',
    },
    PAUSED: {
      label: 'Paused',
      className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      dot: 'bg-slate-400',
    },
    COMPLETED: {
      label: 'Completed',
      className: 'bg-primary/20 text-primary border-primary/35',
      dot: 'bg-primary',
    },
  }[status] || {
    label: status,
    className: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border select-none',
        config.className,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dot)} />
      <span>{config.label}</span>
    </span>
  );
};
