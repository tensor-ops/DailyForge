import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { DialogFooter } from '@/components/dialogs/DialogFooter';
import { DialogLoadingView, DialogErrorView } from '@/components/dialogs/DialogStateViews';
import { useToast } from '@/hooks/useToast';
import { plannerService } from '@/services/plannerService';
import { AutoSchedulePreviewResponse } from '@/types/planner';
import { Sparkles, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

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

  const fetchPreview = () => {
    setLoading(true);
    plannerService
      .getAutoSchedulePreview(date)
      .then((res) => setPreview(res))
      .catch(() => error('Failed to generate preview', 'Please retry.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchPreview();
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
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Auto Schedule Optimization"
      description="Daily Forge balances your capacity and schedules high-impact goal routines."
      icon={Sparkles}
      iconColor="#8B5CF6"
      size="md"
      footer={
        preview ? (
          <DialogFooter
            onCancel={onClose}
            cancelLabel="Keep Current"
            onConfirm={handleApply}
            confirmLabel="Apply Optimized Schedule"
            confirmIcon={Zap}
            isSubmitting={isApplying}
          />
        ) : undefined
      }
    >
      {loading ? (
        <DialogLoadingView
          title="Analyzing Personal Execution Capacity"
          subtitle="Aligning circadian focus windows, goal deadlines, and habit anchors..."
          isAi
        />
      ) : !preview ? (
        <DialogErrorView
          title="Preview Generation Failed"
          message="Could not compute schedule optimization for this date."
          onRetry={fetchPreview}
        />
      ) : (
        <div className="space-y-4 text-left">
          {/* Comparison Delta Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 text-xs">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                Capacity Load
              </span>
              <div className="flex items-center gap-2 font-mono font-bold text-foreground">
                <span className="text-muted-foreground line-through">
                  {preview.capacityBefore}
                </span>
                <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                <span className="text-emerald-400 text-sm">
                  {preview.capacityAfter}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 text-xs">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                Goal Alignment
              </span>
              <div className="flex items-center gap-2 font-mono font-bold text-foreground">
                <span className="text-muted-foreground line-through">
                  {preview.goalAlignmentBefore}
                </span>
                <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                <span className="text-emerald-400 text-sm">
                  {preview.goalAlignmentAfter}
                </span>
              </div>
            </div>
          </div>

          {/* AI Optimizer Strategy Note */}
          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-2.5 text-xs text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-primary font-bold block text-[11px] uppercase tracking-wider">
                Circadian Scheduling Applied
              </span>
              <p className="text-muted-foreground text-[11px] leading-snug">
                Deep work and challenging goal routines placed into 9:00 AM – 11:30 AM peak window. Light habits scheduled during evening wind-down.
              </p>
            </div>
          </div>

          {/* Proposed Adjustments List */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Proposed Schedule Changes ({preview.proposedEvents.length})
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {preview.proposedEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-surface-sunken border border-border/70 text-xs flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-foreground block truncate">
                      {evt.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{evt.category} • {evt.durationMinutes}m</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                      {evt.startTime} – {evt.endTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};
