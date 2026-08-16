import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
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

  // Reset input whenever modal opens with a new habit
  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
      setIsDeleting(false);
    }
  }, [isOpen, habit]);

  if (!habit) return null;

  const targetName = habit.name.trim();
  const isMatch = confirmationInput.trim() === targetName;

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
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      title="Delete habit"
      description="This action cannot be undone. Read carefully before proceeding."
      size="md"
    >
      <form onSubmit={handleDelete} className="space-y-4 pt-1 text-left select-none">
        {/* GitHub-style Warning Callout Box */}
        <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/25 text-danger space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Danger Zone</span>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed">
            This will permanently delete the <strong className="text-danger font-extrabold">{habit.name}</strong> habit,
            all completion history, and reset its{' '}
            <strong className="text-warning inline-flex items-center gap-0.5 font-bold">
              <Flame className="h-3 w-3 fill-warning" />
              {habit.currentStreak || 0}-day streak
            </strong>
            .
          </p>
        </div>

        {/* Verification Prompt */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-muted-foreground">
            To confirm deletion, please type{' '}
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
                ? 'border-danger focus:border-danger focus:ring-danger/40 ring-1 ring-danger/30'
                : 'border-border focus:border-primary focus:ring-primary/40'
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-surface-elevated hover:bg-muted border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isMatch || isDeleting}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer',
              isMatch && !isDeleting
                ? 'bg-danger hover:bg-danger/90 text-white shadow-lg shadow-danger/25 active:scale-[0.98]'
                : 'bg-danger/30 text-danger-foreground/40 border border-danger/20 cursor-not-allowed opacity-60'
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>
              {isDeleting ? 'Deleting...' : 'I understand the consequences, delete this habit'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
