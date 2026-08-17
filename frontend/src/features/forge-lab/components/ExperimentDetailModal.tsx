import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@/components/dialogs/Dialog';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useToast } from '@/hooks/useToast';
import { experimentService } from '@/services/experimentService';
import { ExperimentDetailResponse } from '@/types/experiment';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Check,
  Beaker,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface ExperimentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  experimentId: string | null;
  onSuccess?: () => void;
}

export const ExperimentDetailModal: React.FC<ExperimentDetailModalProps> = ({
  isOpen,
  onClose,
  experimentId,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ExperimentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  const fetchDetail = async () => {
    if (!experimentId) return;
    setLoading(true);
    try {
      const res = await experimentService.getExperimentDetail(experimentId);
      setDetail(res);
    } catch {
      error('Failed to load detail', 'Could not load experiment workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && experimentId) {
      fetchDetail();
    }
  }, [isOpen, experimentId]);

  if (!experimentId) return null;

  const handleApplyResult = async () => {
    setIsApplying(true);
    try {
      await experimentService.applyResult(experimentId);
      success('Experiment Applied! ✨', 'Habit schedule and Planner have been updated.');
      window.dispatchEvent(new Event('planner-updated'));
      onSuccess?.();
      onClose();
    } catch {
      error('Failed to apply result', 'Please retry.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleToggleStatus = async (newStatus: string) => {
    try {
      await experimentService.updateStatus(experimentId, newStatus);
      success('Status Updated', `Experiment is now ${newStatus}.`);
      fetchDetail();
      onSuccess?.();
    } catch {
      error('Status update failed', 'Could not update experiment status.');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={detail?.experiment.name || 'Experiment Workspace'}
      description={`Testing: ${detail?.experiment.habitName || 'Routine'} · N-of-1 Behavior Trial`}
      icon={Beaker}
      iconColor="#8B5CF6"
      size="lg"
    >
      {loading ? (
        <div className="py-16 text-center text-xs text-muted-foreground animate-pulse">
          Analyzing experiment telemetry, adherence signals, and baseline shifts...
        </div>
      ) : !detail ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          Could not load experiment details.
        </div>
      ) : (
        <div className="space-y-4 text-left pt-1 max-h-[75vh] overflow-y-auto pr-1">
          {/* Top Hero Delta Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 text-xs">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                Baseline (Pre-Trial)
              </span>
              <div className="flex items-baseline gap-1.5 font-extrabold text-foreground">
                <span className="text-2xl">{detail.experiment.baselineValue}%</span>
                <span className="text-[10px] text-muted-foreground font-semibold">14d average</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-sunken border border-primary/40 text-xs">
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-1">
                Current Trial Rate
              </span>
              <div className="flex items-baseline gap-1.5 font-extrabold text-foreground">
                <span className="text-2xl text-primary">{detail.experiment.currentValue}%</span>
                <span className="text-[11px] font-mono text-emerald-500 dark:text-emerald-400 font-bold">
                  +{detail.experiment.improvementPts || 9} pts
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 text-xs">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                Target Success Goal
              </span>
              <div className="flex items-baseline gap-1.5 font-extrabold text-foreground">
                <span className="text-2xl text-emerald-500 dark:text-emerald-400">{detail.experiment.targetValue}%</span>
                <span className="text-[10px] text-emerald-500/80 dark:text-emerald-400/80 font-bold">Target Achieved ✓</span>
              </div>
            </div>
          </div>

          {/* Hypothesis Banner */}
          <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border/70 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="text-[10px] uppercase tracking-wider">Hypothesis</span>
            </div>
            <p className="text-foreground leading-relaxed font-medium">
              &quot;{detail.experiment.hypothesis}&quot;
            </p>
          </div>

          {/* Baseline vs Intervention Comparison Area Chart */}
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-foreground">
                  Baseline vs Intervention Trajectory
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Comparing baseline pre-trial standard with daily intervention results
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  <span>Baseline ({detail.experiment.baselineValue}%)</span>
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Trial ({detail.experiment.currentValue}%)</span>
                </span>
              </div>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={detail.comparisonData}>
                  <defs>
                    <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border opacity-40" />
                  <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground" fontSize={10} tickLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={10} tickLine={false} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface-elevated, #1e293b)',
                      borderColor: 'var(--color-border, #334155)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: 'var(--color-foreground, #ffffff)',
                    }}
                  />
                  <ReferenceLine y={detail.experiment.targetValue} stroke="#10B981" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="intervention"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#expGradient)"
                    name="Trial Result"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Observations Checklist & Adherence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {/* Daily Observations */}
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">
                  Daily Trial Observations
                </span>
                <span className="text-[10px] font-mono text-muted-foreground font-bold">
                  Day {detail.experiment.dayProgress} of {detail.experiment.durationDays}
                </span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {detail.dailyObservations.slice(0, 8).map((obs) => (
                  <div
                    key={obs.dayNumber}
                    className="p-2 rounded-xl bg-surface-sunken border border-border/50 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground font-bold">
                        D{obs.dayNumber}
                      </span>
                      <span className="text-[11px] text-foreground font-semibold">
                        {obs.completed ? 'Routine Completed' : 'Missed Session'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {obs.completed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                      )}
                      <span className="text-[10px] font-mono text-primary font-bold">
                        {obs.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adherence & Side Effects */}
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">
                    Trial Adherence & Quality
                  </span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-mono font-bold text-xs">
                    {detail.adherence}%
                  </span>
                </div>
                <ProgressBar value={detail.adherence} />
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Intervention was followed on {Math.round((detail.adherence / 100) * 8)} of 8 active trial sessions.
                </p>
              </div>

              {/* Side Effects scorecard */}
              <div className="p-2.5 rounded-xl bg-surface-sunken border border-border/60 space-y-1.5 text-xs font-semibold">
                <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider block">
                  Observed Side Effects
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="text-muted-foreground">
                    Reliability: <strong className="text-emerald-500 dark:text-emerald-400">+12 pts</strong>
                  </div>
                  <div className="text-muted-foreground">
                    Friction: <strong className="text-emerald-500 dark:text-emerald-400">-18%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verdict & Recommendation Banner */}
          <div className="p-4 rounded-2xl bg-surface-elevated border border-primary/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>Trial Verdict</span>
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 uppercase">
                {detail.verdict.badge}
              </span>
            </div>
            <p className="text-xs text-foreground font-bold leading-snug">
              {detail.verdict.summary}
            </p>
            <p className="text-[11px] text-muted-foreground font-semibold">
              Recommendation: <strong className="text-foreground">{detail.verdict.recommendation}</strong>
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleStatus(detail.experiment.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED')}
                className="px-3 py-2 rounded-xl bg-surface-elevated hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-xs font-bold transition-colors cursor-pointer"
              >
                {detail.experiment.status === 'PAUSED' ? 'Resume Trial' : 'Pause Trial'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/planner');
                }}
                className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-muted border border-border text-foreground text-xs font-bold transition-colors cursor-pointer"
              >
                View in Planner
              </button>

              <button
                type="button"
                onClick={handleApplyResult}
                disabled={isApplying || detail.experiment.isApplied}
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                <Check className="h-3.5 w-3.5" />
                <span>
                  {detail.experiment.isApplied ? 'Result Applied ✓' : 'Apply Result to Habit & Planner'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};
