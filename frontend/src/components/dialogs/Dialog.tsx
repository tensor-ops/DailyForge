import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: DialogSize;
  showCloseButton?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  iconColor = '#F97316',
  badge,
  children,
  footer,
  className,
  size = 'md',
  showCloseButton = true,
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

  const sizeClasses: Record<DialogSize, string> = {
    sm: 'max-w-md sm:max-w-md',
    md: 'max-w-lg sm:max-w-xl',
    lg: 'max-w-2xl sm:max-w-3xl',
    xl: 'max-w-3xl sm:max-w-4xl',
    full: 'max-w-5xl sm:max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Dialog Card */}
      <div
        className={cn(
          'relative z-50 w-full max-h-[88vh] flex flex-col bg-[#0D1527] border border-border/90 rounded-2xl shadow-2xl animate-scale-in text-foreground text-left transition-all overflow-hidden',
          sizeClasses[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-border/60 shrink-0 bg-[#0D1527]">
            <div className="flex items-start gap-3.5 min-w-0 pr-4">
              {Icon && (
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-sm"
                  style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
                >
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {title && (
                    <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight leading-tight truncate">
                      {title}
                    </h2>
                  )}
                  {badge && <div>{badge}</div>}
                </div>
                {description && (
                  <div className="text-xs text-muted-foreground leading-normal">
                    {description}
                  </div>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 pt-4 flex-1 overflow-y-auto space-y-4">
          {children}
        </div>

        {/* Optional Pinned Footer */}
        {footer && (
          <div className="p-4 sm:p-5 pt-3.5 border-t border-border/60 shrink-0 bg-[#0A1020]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
