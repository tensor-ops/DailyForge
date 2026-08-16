import React from 'react';
import { cn } from '@/utils/cn';

interface DialogSectionProps {
  stepNumber?: number | string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  borderTop?: boolean;
}

export const DialogSection: React.FC<DialogSectionProps> = ({
  stepNumber,
  title,
  subtitle,
  badge,
  action,
  children,
  className,
  borderTop = false,
}) => {
  return (
    <div
      className={cn(
        'space-y-3',
        borderTop && 'pt-3.5 border-t border-border/60',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {stepNumber && (
            <span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-mono font-bold shrink-0">
              {stepNumber}
            </span>
          )}
          <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
            {title}
          </span>
          {badge && <div>{badge}</div>}
        </div>
        {action && <div>{action}</div>}
      </div>

      {subtitle && (
        <p className="text-[11px] text-muted-foreground leading-snug">
          {subtitle}
        </p>
      )}

      <div>{children}</div>
    </div>
  );
};
