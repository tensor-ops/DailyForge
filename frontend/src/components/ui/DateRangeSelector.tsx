import React from 'react';
import { cn } from '@/utils/cn';

interface DateRangeSelectorProps {
  value: '7d' | '30d' | '90d' | '1y';
  onChange: (value: '7d' | '30d' | '90d' | '1y') => void;
  className?: string;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const options = ['7d', '30d', '90d', '1y'] as const;

  return (
    <div className={cn('flex bg-surface-sunken p-1 border border-border rounded-xl text-xs font-bold text-muted-foreground w-max shrink-0 select-none', className)}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'px-3 py-1.5 rounded-lg uppercase tracking-wide cursor-pointer transition-colors focus:outline-none',
            value === opt
              ? 'bg-primary text-primary-foreground font-extrabold'
              : 'hover:text-foreground hover:bg-muted/30'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};
