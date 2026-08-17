import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { useToast } from '@/hooks/useToast';
import { Habit } from '@/types/habit';
import { Dialog } from '@/components/dialogs/Dialog';
import { Button } from '@/components/ui/Button';

interface MissReasonModalProps {
  isOpen: boolean;
  habit: Habit | null;
  onClose: () => void;
  onLogged?: () => void;
}

const REASONS = [
  'Forgot',
  'Too busy',
  'Too difficult',
  'Wrong time',
  'Low energy',
  'Not important today',
  'Other',
];

export const MissReasonModal: React.FC<MissReasonModalProps> = ({
  isOpen,
  habit,
  onClose,
  onLogged,
}) => {
  const { success, error } = useToast();
  const [reason, setReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!habit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await analyticsService.logHabitMiss({
        habitId: habit.id,
        reason,
        notes,
      });
      success('Friction logged! ✓', `Logged miss reason: "${reason}"`);
      if (onLogged) onLogged();
      onClose();
    } catch {
      error('Logging failed', 'Unable to store skip reason.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Log Habit Friction"
      description={`Understand why "${habit.name}" was missed today to adapt future routines.`}
      icon={AlertCircle}
      iconColor="#F59E0B"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">
            Primary Reason for Missing
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs font-semibold bg-surface-sunken border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary transition"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">
            Context Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g., Unexpected emergency meeting came up"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs font-medium bg-surface-sunken border border-border rounded-xl p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition resize-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? 'Logging...' : 'Log Friction'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
