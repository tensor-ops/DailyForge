import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg sm:max-w-xl',
    lg: 'max-w-2xl sm:max-w-3xl',
    xl: 'max-w-3xl sm:max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Theme-Aware Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        className={cn(
          'relative z-50 w-full max-h-[88vh] flex flex-col bg-surface-elevated text-foreground border border-border rounded-2xl shadow-popover animate-scale-in text-left transition-all overflow-hidden',
          sizeClasses[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-border shrink-0 bg-surface-elevated">
          <div className="space-y-1 min-w-0 pr-4">
            {title && (
              <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight leading-tight truncate">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-muted-foreground leading-normal">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 pt-4 flex-1 overflow-y-auto text-foreground space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
