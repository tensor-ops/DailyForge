import React from 'react';
import { cn } from '@/utils/cn';
import { getCellColorClass } from './HeatmapCell';
import { ConsistencyLevel } from './heatmap.types';

export const HeatmapLegend: React.FC<{ className?: string }> = ({ className }) => {
  const levels: { level: ConsistencyLevel; label: string }[] = [
    { level: 0, label: '0%' },
    { level: 1, label: '25%' },
    { level: 2, label: '50%' },
    { level: 3, label: '75%' },
    { level: 5, label: '100%' },
  ];

  return (
    <div
      className={cn(
        'flex items-center justify-between sm:justify-end gap-2 text-[10px] text-muted-foreground font-semibold select-none pt-1',
        className
      )}
    >
      <span className="text-[9px] tracking-wide uppercase">Less</span>
      <div className="flex items-center gap-1">
        {levels.map(({ level, label }) => (
          <div
            key={level}
            className={cn(
              'h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-[2px]',
              getCellColorClass(level, false)
            )}
            title={`${label} consistency`}
          />
        ))}
      </div>
      <span className="text-[9px] tracking-wide uppercase">More</span>
    </div>
  );
};
