import React from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ForgeScoreBreakdown } from '@/types/habitIntelligence';
import { Sparkles, Info } from 'lucide-react';

interface ForgeScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: ForgeScoreBreakdown | null;
}

export const ForgeScoreModal: React.FC<ForgeScoreModalProps> = ({
  isOpen,
  onClose,
  breakdown,
}) => {
  if (!breakdown) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Forge Score Engine"
      description="A transparent, weighted indicator of your routine execution power."
      icon={Sparkles}
      iconColor="#F59E0B"
      size="md"
    >
      <div className="space-y-4 text-left pt-1">
        {/* Hero Score Display */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-sunken border border-border/80 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block">
              Current Forge Score
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-4xl font-black text-foreground">{breakdown.score}</span>
              <span className="text-xs text-muted-foreground font-bold">/ 1000 pts</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 font-semibold">
              Top execution consistency across all tracked habits
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Breakdown Metric Rows */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
            Weighted Score Breakdown
          </span>

          <div className="space-y-2 text-xs font-semibold">
            {/* Consistency */}
            <div className="p-3 rounded-xl bg-surface-elevated border border-border/70 space-y-1.5">
              <div className="flex justify-between items-center text-foreground">
                <span className="font-bold">Consistency (Weight: {breakdown.weights.consistency})</span>
                <span className="font-mono text-primary font-bold">{breakdown.consistency}%</span>
              </div>
              <ProgressBar value={breakdown.consistency} />
            </div>

            {/* Execution */}
            <div className="p-3 rounded-xl bg-surface-elevated border border-border/70 space-y-1.5">
              <div className="flex justify-between items-center text-foreground">
                <span className="font-bold">Execution (Weight: {breakdown.weights.execution})</span>
                <span className="font-mono text-emerald-500 dark:text-emerald-400 font-bold">{breakdown.execution}%</span>
              </div>
              <ProgressBar value={breakdown.execution} />
            </div>

            {/* Reliability */}
            <div className="p-3 rounded-xl bg-surface-elevated border border-border/70 space-y-1.5">
              <div className="flex justify-between items-center text-foreground">
                <span className="font-bold">Reliability (Weight: {breakdown.weights.reliability})</span>
                <span className="font-mono text-cyan-500 dark:text-cyan-400 font-bold">{breakdown.reliability}%</span>
              </div>
              <ProgressBar value={breakdown.reliability} />
            </div>

            {/* Momentum */}
            <div className="p-3 rounded-xl bg-surface-elevated border border-border/70 space-y-1.5">
              <div className="flex justify-between items-center text-foreground">
                <span className="font-bold">Momentum (Weight: {breakdown.weights.momentum})</span>
                <span className="font-mono text-warning font-bold">{breakdown.momentum} pts</span>
              </div>
              <ProgressBar value={breakdown.momentum} />
            </div>

            {/* Recovery */}
            <div className="p-3 rounded-xl bg-surface-elevated border border-border/70 space-y-1.5">
              <div className="flex justify-between items-center text-foreground">
                <span className="font-bold">Recovery (Weight: {breakdown.weights.recovery})</span>
                <span className="font-mono text-emerald-500 dark:text-emerald-400 font-bold">{breakdown.recovery}%</span>
              </div>
              <ProgressBar value={breakdown.recovery} />
            </div>
          </div>
        </div>

        {/* Formula Explainer Footer */}
        <div className="p-3.5 rounded-xl bg-surface-sunken border border-border/60 text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5 text-foreground font-bold">
            <Info className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Mathematical Formula</span>
          </div>
          <p className="text-[11px] font-mono text-foreground/80">{breakdown.formula}</p>
        </div>
      </div>
    </Dialog>
  );
};
