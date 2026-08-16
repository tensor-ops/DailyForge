import React from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface DialogFooterProps {
  onCancel?: () => void;
  cancelLabel?: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'outline';
  isSubmitting?: boolean;
  disabled?: boolean;
  confirmIcon?: React.ComponentType<{ className?: string }>;
  leftAction?: React.ReactNode;
  hintText?: string;
  className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({
  onCancel,
  cancelLabel = 'Cancel',
  onConfirm,
  confirmLabel = 'Save Changes',
  confirmVariant = 'primary',
  isSubmitting = false,
  disabled = false,
  confirmIcon: ConfirmIcon,
  leftAction,
  hintText,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 flex-wrap',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {leftAction}
        {hintText && (
          <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline-block">
            {hintText}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            {cancelLabel}
          </Button>
        )}

        <Button
          type={onConfirm ? 'button' : 'submit'}
          variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          isLoading={isSubmitting}
          disabled={disabled || isSubmitting}
          className="text-xs font-bold shadow-md active:scale-[0.98] flex items-center gap-1.5"
        >
          {ConfirmIcon && !isSubmitting && <ConfirmIcon className="h-3.5 w-3.5" />}
          <span>{confirmLabel}</span>
        </Button>
      </div>
    </div>
  );
};
