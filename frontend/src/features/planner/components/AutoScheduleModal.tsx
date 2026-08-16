import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { plannerService } from '@/services/plannerService';
import { AutoSchedulePreviewResponse } from '@/types/planner';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AutoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  onSuccess?: () => void;
}

export const AutoScheduleModal: React.FC<AutoScheduleModalProps> = ({
  isOpen,
  onClose,
  date,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [preview, setPreview] = useState<AutoSchedulePreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      plannerService
        .getAutoSchedulePreview(date)
        .then((res) => setPreview(res))
        .catch(() => error('Failed to generate preview', 'Please retry.'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, date]);

  const handleApply = async () => {
    if (!preview) return;
    setIsApplying(true);
    try {
      await plannerService.applyAutoSchedule(date, preview.proposedEvents);
      success('Schedule optimized! ✨', 'Your day has been aligned with your optimal rhythm.');
      window.dispatchEvent(new Event('planner-updated'));
      onSuccess?.();
      onClose();
    } catch {
      error('Failed to apply schedule', 'Please retry.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Auto Schedule Optimization"
      description="Daily Forge balances your capacity and schedules high-impact goal routines."
      size="md"
    >
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="h-8 w-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">
            Analyzing capacity, optimal windows, and goal priorities...
          </p>
        </div>
      ) : !preview ? null : (
        <div className="space-y-4 text-left pt-1">
          {/* Comparison Delta Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 text-xs">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                Capacity Load
              </span>
              <div className="flex items-center gap-1.5 font-extrabold text-foreground">
                <span className="text-warning line-through">{preview.capacityBefore}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-emerald-400">{preview.capacityAfter} (Balanced)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 text-xs">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                Goal Alignment
              </span>
              <div className="flex items-center gap-1.5 font-extrabold text-foreground">
                <span className="text-muted-foreground">{preview.goalAlignmentBefore}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-primary">{preview.goalAlignmentAfter}</span>
              </div>
            </div>
          </div>

          {/* Key Adjustments */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">
              Key Adjustments
            </span>
            <div className="space-y-1.5">
              {preview.changes.map((c, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-surface-elevated border border-border/70 text-xs flex items-center gap-2.5"
                >
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 uppercase shrink-0">
                    {c.action}
                  </span>
                  <span className="text-foreground font-semibold truncate text-[11px]">
                    {c.item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Optimized Day Flow Blocks */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                Optimized Day Flow
              </span>
              <span className="text-[10px] font-mono text-muted-foreground font-bold">
                {preview.proposedEvents.length} blocks
              </span>
            </div>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {preview.proposedEvents.map((e, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-surface-sunken border border-border/50 text-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-primary font-extrabold shrink-0">
                      {e.startTime}
                    </span>
                    <span className="text-foreground font-bold truncate">{e.title}</span>
                  </div>
                  {e.goalTitle && (
                    <span className="text-[9px] text-muted-foreground font-semibold truncate shrink-0">
                      🎯 {e.goalTitle}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying}
              className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 fill-white" />
              <span>Apply Optimized Schedule</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
