import React from 'react';
import { cn } from '@/utils/cn';

interface DialogFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  badge?: React.ReactNode;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const DialogField: React.FC<DialogFieldProps> = ({
  label,
  required,
  optional,
  badge,
  helperText,
  error,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-1.5 text-left', className)}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-primary">*</span>}
          {optional && (
            <span className="text-[10px] font-normal text-muted-foreground lowercase">
              (optional)
            </span>
          )}
        </label>
        {badge && <div>{badge}</div>}
      </div>

      <div>{children}</div>

      {error ? (
        <p className="text-[11px] font-semibold text-rose-400 leading-tight">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[10px] font-medium text-muted-foreground/80 leading-tight">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
