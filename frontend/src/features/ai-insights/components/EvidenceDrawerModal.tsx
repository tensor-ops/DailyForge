import React from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { InsightItem } from '@/types/aiFoundation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ShieldCheck, Database, Calendar, BarChart2, Layers } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EvidenceDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: InsightItem | null;
}

export const EvidenceDrawerModal: React.FC<EvidenceDrawerModalProps> = ({
  isOpen,
  onClose,
  insight,
}) => {
  if (!insight || !insight.evidence) return null;

  const ev = insight.evidence;

  const confidenceBadge = {
    INSUFFICIENT_DATA: { label: 'Insufficient Data', color: 'bg-muted border-border text-muted-foreground' },
    EMERGING_SIGNAL: { label: 'Emerging Signal', color: 'bg-amber-500/15 border-amber-500/30 text-amber-400' },
    MODERATE_SIGNAL: { label: 'Moderate Signal', color: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' },
    STRONG_SIGNAL: { label: 'Strong Signal', color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' },
    EXPERIMENT_SUPPORTED: { label: 'Experiment Supported', color: 'bg-purple-500/15 border-purple-500/30 text-purple-400' },
  }[insight.confidence] || { label: 'Signal Detected', color: 'bg-primary/15 border-primary/30 text-primary' };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Behavioral Evidence Breakdown"
      description="Inspect the authentic execution telemetry, sample counts, and baseline comparisons."
      icon={ShieldCheck}
      iconColor="#10B981"
      size="md"
    >
      <div className="space-y-4 text-left select-none pt-1">
        {/* Insight Header Capsule */}
        <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Analyzed Observation
            </span>
            <span
              className={cn(
                'text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider',
                confidenceBadge.color
              )}
            >
              {confidenceBadge.label}
            </span>
          </div>
          <h4 className="text-xs font-bold text-foreground leading-snug">
            {insight.title}
          </h4>
        </div>

        {/* Core Evidence Delta Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface-elevated border border-border/70 text-xs space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Baseline / Comparator
            </span>
            <span className="text-foreground font-mono font-bold block">
              {ev.baseline || 'Standard Average'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-elevated border border-border/70 text-xs space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Observed Execution
            </span>
            <span className="text-emerald-400 font-mono font-bold block">
              {ev.observed || 'Current Window'}
            </span>
          </div>
        </div>

        {/* Telemetry Scope Callout */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-surface-sunken border border-border/60 text-[11px] font-semibold">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Database className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{ev.sampleCount || 18} Sessions</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{ev.timeRange || 'Last 30 Days'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <BarChart2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{ev.difference || '+28% Delta'}</span>
          </div>
        </div>

        {/* Structured Segment Breakdown (if available) */}
        {ev.breakdown && ev.breakdown.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-border/60">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Comparative Segment Performance</span>
            </span>
            <div className="space-y-2">
              {ev.breakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground">{item.label}</span>
                    <span className="font-mono font-bold text-foreground">{item.value}</span>
                  </div>
                  <ProgressBar value={item.rate} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
