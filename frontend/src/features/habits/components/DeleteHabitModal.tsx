import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { DialogFooter } from '@/components/dialogs/DialogFooter';
import { Habit } from '@/types/habit';
import { AlertTriangle, Flame, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DeleteHabitModalProps {
  isOpen: boolean;
  habit: Habit | null;
  onClose: () => void;
  onConfirmDelete: (habit: Habit) => Promise<void>;
}

export const DeleteHabitModal: React.FC<DeleteHabitModalProps> = ({
  isOpen,
  habit,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
      setIsDeleting(false);
    }
  }, [isOpen, habit]);

  if (!habit) return null;

  const targetName = habit.name.trim();
  const isMatch = confirmationInput.trim().toLowerCase() === targetName.toLowerCase();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch || isDeleting) return;

    setIsDeleting(true);
    try {
      await onConfirmDelete(habit);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      title="Delete Habit Permanently"
      description="This destructive action permanently removes all tracking history."
      icon={Trash2}
      iconColor="#EF4444"
      size="sm"
      footer={
        <DialogFooter
          onCancel={onClose}
          cancelLabel="Keep Habit"
          onConfirm={() => handleDelete({ preventDefault: () => {} } as any)}
          confirmLabel={isDeleting ? 'Deleting...' : 'Permanently Delete'}
          confirmVariant="danger"
          disabled={!isMatch || isDeleting}
          isSubmitting={isDeleting}
          confirmIcon={Trash2}
        />
      }
    >
      <form onSubmit={handleDelete} className="space-y-3.5 text-left select-none">
        {/* Warning Callout Box */}
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-2">
          <div className="flex items-center gap-1.5 font-extrabold text-[11px] uppercase tracking-wider text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Permanent Deletion Warning</span>
          </div>
          <p className="text-xs text-foreground leading-relaxed font-medium">
            This will permanently remove the <strong className="text-rose-400 font-extrabold">{habit.name}</strong> habit,
            its completion logs, and reset its{' '}
            <strong className="text-amber-400 inline-flex items-center gap-0.5 font-bold">
              <Flame className="h-3.5 w-3.5 fill-amber-400" />
              {habit.currentStreak || 0}-day streak
            </strong>
            .
          </p>
        </div>

        {/* Verification Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground">
            To confirm deletion, type{' '}
            <code className="px-1.5 py-0.5 rounded bg-surface-sunken border border-border text-foreground font-bold font-mono text-xs select-all">
              {targetName}
            </code>{' '}
            below:
          </label>
          <input
            type="text"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder={targetName}
            autoFocus
            disabled={isDeleting}
            className={cn(
              'w-full rounded-xl border bg-surface-sunken/60 px-3.5 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:ring-2',
              isMatch
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/40 ring-1 ring-rose-500/30'
                : 'border-border focus:border-primary focus:ring-primary/40'
            )}
          />
        </div>
      </form>
    </Dialog>
  );
};
