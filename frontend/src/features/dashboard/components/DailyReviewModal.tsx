import React, { useState } from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { DialogFooter } from '@/components/dialogs/DialogFooter';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { todayService } from '@/services/todayService';
import { TodayOverviewResponse } from '@/types/today';
import { Sparkles, Moon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DailyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  overview: TodayOverviewResponse;
  onSuccess?: () => void;
}

const MOODS = [
  { id: 'great', label: 'Great', emoji: '🔥', desc: 'High energy & flow' },
  { id: 'good', label: 'Good', emoji: '✨', desc: 'Solid execution' },
  { id: 'okay', label: 'Okay', emoji: '🌱', desc: 'Met baseline' },
  { id: 'difficult', label: 'Difficult', emoji: '⚒️', desc: 'Faced friction' },
] as const;

export const DailyReviewModal: React.FC<DailyReviewModalProps> = ({
  isOpen,
  onClose,
  overview,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [rating, setRating] = useState<'great' | 'good' | 'okay' | 'difficult'>('good');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgeNote, setForgeNote] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await todayService.submitDailyReview(rating, notes, overview.date);
      setForgeNote(res.forgeNote);
      success('Review recorded! ✦', 'Daily Forge consistency logged.');
      onSuccess?.();
    } catch {
      error('Review submission failed', 'Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="End of Day Momentum Review"
      description={`Reflect on execution, celebrate wins, and close out ${overview.formattedDate}.`}
      icon={Moon}
      iconColor="#8B5CF6"
      size="md"
      footer={
        forgeNote ? (
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={onClose}>
              Done & Close
            </Button>
          </div>
        ) : (
          <DialogFooter
            onCancel={onClose}
            cancelLabel="Cancel"
            onConfirm={undefined}
            confirmLabel="Complete Day Review"
            isSubmitting={isSubmitting}
            confirmIcon={Sparkles}
          />
        )
      }
    >
      {forgeNote ? (
        <div className="space-y-4 text-left py-2">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Today&apos;s AI Forge Note</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                Consistency +4%
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-relaxed">
              {forgeNote}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Summary Cockpit Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-surface-sunken border border-border/80 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block font-bold uppercase">
                Completion
              </span>
              <span className="text-foreground font-extrabold text-sm">
                {overview.progress.completed} / {overview.progress.total} ({overview.progress.percentage}%)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block font-bold uppercase">
                Focus Time
              </span>
              <span className="text-foreground font-extrabold text-sm">
                {overview.focusTime.formattedCompleted}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block font-bold uppercase">
                Top Routine
              </span>
              <span className="text-primary font-bold truncate block">
                {overview.endOfDay.strongestHabit}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block font-bold uppercase">
                Attention
              </span>
              <span className="text-amber-400 font-bold truncate block">
                {overview.endOfDay.needsAttention}
              </span>
            </div>
          </div>

          {/* Mood Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground block">
              How did today feel overall?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setRating(m.id)}
                  className={cn(
                    'p-2.5 rounded-xl border text-center transition-all cursor-pointer select-none space-y-0.5',
                    rating === m.id
                      ? 'bg-primary/15 border-primary text-foreground shadow-sm'
                      : 'bg-surface-sunken border-border/70 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="text-lg block">{m.emoji}</span>
                  <span className="text-xs font-bold block">{m.label}</span>
                  <span className="text-[9px] text-muted-foreground block truncate">
                    {m.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reflection Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground block">
              Daily Reflection (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What worked well? What friction or distraction did you encounter?"
              className="w-full p-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </form>
      )}
    </Dialog>
  );
};
