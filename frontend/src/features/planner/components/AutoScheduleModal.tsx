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
      description="Daily Forge will balance your capacity and schedule high-impact goal actions."
      size="md"
    >
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
          Analyzing capacity, optimal windows, and goal priorities...
        </div>
      ) : !preview ? null : (
        <div className="space-y-4 text-left pt-1">
          {/* Comparison Delta Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-surface-sunken border border-border/80 text-xs">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">
                Capacity Load
              </span>
              <div className="flex items-center gap-1.5 font-extrabold text-foreground">
                <span className="text-warning line-through">{preview.capacityBefore}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-success">{preview.capacityAfter} (Balanced)</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-surface-sunken border border-border/80 text-xs">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">
                Goal Alignment
              </span>
              <div className="flex items-center gap-1.5 font-extrabold text-foreground">
                <span className="text-muted-foreground">{preview.goalAlignmentBefore}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-primary">{preview.goalAlignmentAfter}</span>
              </div>
            </div>
          </div>

          {/* Proposed Optimizations List */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">
              Key Adjustments
            </span>
            <div className="space-y-1.5">
              {preview.changes.map((c, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-surface-elevated border border-border/70 text-xs flex items-center gap-2"
                >
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 uppercase shrink-0">
                    {c.action}
                  </span>
                  <span className="text-foreground font-medium truncate">{c.item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline preview */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
              Optimized Day Flow ({preview.proposedEvents.length} blocks)
            </span>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {preview.proposedEvents.map((e, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-surface-sunken border border-border/50 text-xs flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono text-primary font-bold">{e.startTime}</span>
                    <span className="text-foreground font-bold truncate">{e.title}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground truncate">{e.goalTitle}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 fill-white" />
              <span>Apply Optimized Schedule</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
