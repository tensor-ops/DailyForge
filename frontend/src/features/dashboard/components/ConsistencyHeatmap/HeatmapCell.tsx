import React from 'react';
import { ConsistencyDay, ConsistencyLevel } from './heatmap.types';
import { cn } from '@/utils/cn';

interface HeatmapCellProps {
  day: ConsistencyDay;
  isSelected: boolean;
  onSelect: (day: ConsistencyDay) => void;
  onMouseEnter: (e: React.MouseEvent<HTMLDivElement>, day: ConsistencyDay) => void;
  onMouseLeave: () => void;
}

export const getCellColorClass = (level: ConsistencyLevel, isFuture: boolean): string => {
  if (isFuture) {
    return 'bg-surface-sunken/20 border border-border/10 opacity-30 cursor-not-allowed';
  }

  switch (level) {
    case -1:
      // No habits scheduled on this day
      return 'bg-muted/20 border border-border/15';
    case 0:
      // 0% completion (habits were scheduled but none done)
      return 'bg-muted/40 border border-border/30';
    case 1:
      // 1–24%
      return 'bg-blue-950/80 border border-blue-900/40';
    case 2:
      // 25–49%
      return 'bg-blue-900/60 border border-blue-800/50';
    case 3:
      // 50–74%
      return 'bg-blue-600/80 border border-blue-500/50';
    case 4:
      // 75–99%
      return 'bg-orange-500/80 border border-orange-400/50';
    case 5:
      // 100% Perfect
      return 'bg-orange-500 border border-orange-400 shadow-[0_0_6px_rgba(249,115,22,0.45)]';
    default:
      return 'bg-muted/20 border border-border/10';
  }
};

export const HeatmapCell: React.FC<HeatmapCellProps> = ({
  day,
  isSelected,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}) => {
  const formattedDate = day.dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const ariaLabel = day.isFuture
    ? `${formattedDate} (Future)`
    : day.scheduled === 0
    ? `${formattedDate}: No habits scheduled`
    : `${formattedDate}: ${day.completed} of ${day.scheduled} habits completed (${day.percentage}% consistency)`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!day.isFuture) {
        onSelect(day);
      }
    }
  };

  return (
    <div
      role="gridcell"
      tabIndex={day.isFuture ? -1 : 0}
      aria-label={ariaLabel}
      aria-selected={isSelected}
      onClick={() => {
        if (!day.isFuture) {
          onSelect(day);
        }
      }}
      onKeyDown={handleKeyDown}
      onMouseEnter={(e) => onMouseEnter(e, day)}
      onMouseLeave={onMouseLeave}
      onFocus={(e) => onMouseEnter(e as unknown as React.MouseEvent<HTMLDivElement>, day)}
      onBlur={onMouseLeave}
      className={cn(
        'h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-[3px] transition-all duration-150 cursor-pointer select-none outline-none',
        getCellColorClass(day.level, day.isFuture),
        day.isToday &&
          'ring-1.5 ring-orange-500 ring-offset-1 ring-offset-card',
        isSelected &&
          'ring-2 ring-primary ring-offset-1 ring-offset-card scale-110 z-10',
        !day.isFuture && 'hover:scale-115 hover:z-10 focus-visible:ring-2 focus-visible:ring-primary'
      )}
    />
  );
};
