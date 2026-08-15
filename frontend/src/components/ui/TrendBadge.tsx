import React from 'react';
import { cn } from '@/utils/cn';

interface TrendBadgeProps {
  value: string | number;
  positive?: boolean;
  neutral?: boolean;
  className?: string;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({
  value,
  positive = true,
  neutral = false,
  className,
}) => {
  return (
    <span
      className={cn(
        'text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 select-none font-mono',
        neutral
          ? 'bg-muted text-muted-foreground'
          : positive
          ? 'bg-[#10B981]/15 text-[#10B981]'
          : 'bg-[#EF4444]/15 text-[#EF4444]',
        className
      )}
    >
      {neutral ? '' : positive ? '↑ ' : '↓ '}
      {value}
    </span>
  );
};
