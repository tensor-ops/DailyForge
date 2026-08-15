import React from 'react';
import { Card } from './Card';
import { cn } from '@/utils/cn';

interface ChartCardProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  actions,
  children,
  className,
}) => {
  return (
    <Card className={cn('bg-card border border-border rounded-card p-5 flex flex-col gap-4 text-left select-none', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="flex-1 min-h-[200px] w-full">{children}</div>
    </Card>
  );
};
