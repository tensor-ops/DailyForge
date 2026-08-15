import React from 'react';
import { cn } from '@/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  children,
  className,
}) => {
  return (
    <div className={cn('border-b border-[#1D293D]/70 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none', className)}>
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8FAFC]">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[#94A3B8] font-semibold">
            {description}
          </p>
        )}
        {children && <div className="pt-2">{children}</div>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
