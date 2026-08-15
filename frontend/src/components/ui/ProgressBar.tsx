import React from 'react';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  accent?: 'blue' | 'green' | 'orange' | 'cyan';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  accent = 'blue',
  className,
}) => {
  const barColors = {
    blue: 'bg-[#2563EB]',
    green: 'bg-[#10B981]',
    orange: 'bg-[#F59E0B]',
    cyan: 'bg-[#22D3EE]',
  };

  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('h-2 w-full bg-[#151D2C] rounded-full overflow-hidden select-none', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', barColors[accent])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
