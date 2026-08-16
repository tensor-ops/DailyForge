import React from 'react';
import { Dialog } from './Dialog';
import { DialogFooter } from './DialogFooter';
import { AlertTriangle, Trash2, Archive, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isSubmitting?: boolean;
  itemTitle?: string;
  consequences?: string[];
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isSubmitting = false,
  itemTitle,
  consequences = [],
}) => {
  const Icon = variant === 'danger' ? Trash2 : variant === 'warning' ? Archive : HelpCircle;
  const iconColor = variant === 'danger' ? '#EF4444' : variant === 'warning' ? '#F59E0B' : '#3B82F6';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={Icon}
      iconColor={iconColor}
      size="sm"
      footer={
        <DialogFooter
          onCancel={onClose}
          cancelLabel={cancelLabel}
          onConfirm={onConfirm}
          confirmLabel={confirmLabel}
          confirmVariant={variant === 'danger' ? 'danger' : 'primary'}
          isSubmitting={isSubmitting}
        />
      }
    >
      <div className="space-y-3 text-left">
        {itemTitle && (
          <div className="p-3 rounded-xl bg-surface-sunken border border-border text-xs font-bold text-foreground">
            &quot;{itemTitle}&quot;
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>

        {consequences.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5 text-xs text-rose-300">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-rose-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Consequences</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground">
              {consequences.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Dialog>
  );
};
