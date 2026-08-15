import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { useToast } from '@/hooks/useToast';
import { Habit } from '@/types/habit';

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

  if (!isOpen || !habit) return null;

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
    } catch (err) {
      error('Logging failed', 'Unable to store skip reason.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-sunken/85 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 border-b border-border/10 pb-3">
          <AlertCircle className="h-4.5 w-4.5 text-warning shrink-0" />
          <h3 className="text-sm font-extrabold text-foreground">Why was &quot;{habit.name}&quot; missed?</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">Primary Friction Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-surface-sunken border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-primary/50"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">Notes / Detail (Optional)</label>
            <textarea
              rows={2}
              placeholder="Provide context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-sunken border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-muted hover:bg-muted text-slate-300 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary hover:bg-primary-hover text-foreground font-bold text-xs py-2 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer text-center"
            >
              {submitting ? 'Logging...' : 'Log Friction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
