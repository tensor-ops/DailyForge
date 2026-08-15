import React, { useEffect, useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { analyticsService } from '@/services/analyticsService';
import { Experiment } from '@/types/behavior';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { Beaker, Plus, Check, Ban } from 'lucide-react';

export const ForgeLabPage: React.FC = () => {
  useDocumentTitle('DailyForge — Forge Lab');
  const { success, error } = useToast();

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [durationDays, setDurationDays] = useState(14);
  const [baselineMetric, setBaselineMetric] = useState('72% Consistency');
  const [targetValue, setTargetValue] = useState(80);
  const [submitting, setSubmitting] = useState(false);

  const fetchExperiments = async () => {
    try {
      const list = await analyticsService.getExperiments();
      setExperiments(list);
    } catch (err) {
      error('Load failed', 'Unable to fetch experiments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await analyticsService.createExperiment({
        name,
        hypothesis,
        durationDays,
        baselineMetric,
        targetValue,
      });
      success('Experiment started! ✦', `Test "${name}" is active for ${durationDays} days.`);
      setIsCreating(false);
      setName('');
      setHypothesis('');
      fetchExperiments();
    } catch (err) {
      error('Failed to start', 'Unable to create experiment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'completed' | 'discarded', result: string) => {
    try {
      await analyticsService.updateExperiment(id, { status, result });
      success('Status updated', `Experiment marked as ${status}.`);
      fetchExperiments();
    } catch (err) {
      error('Update failed', 'Could not save status change.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left select-none">
      {/* Header */}
      <div className="border-b border-border/40 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Forge Lab & Experiments
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-semibold">
            Formulate hypotheses and run structured behavior tests.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-primary text-foreground rounded-xl hover:bg-primary-hover transition-all active:scale-[0.98] cursor-pointer shadow-md shrink-0 w-max"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>New Experiment</span>
        </button>
      </div>

      {/* Form Card if active */}
      {isCreating && (
        <Card className="bg-card border border-primary/20 rounded-card p-5 max-w-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 mb-4 border-b border-border/10 pb-3">
            <Beaker className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Initiate Behavior Test</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-muted-foreground">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-foreground">Experiment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Study stacking at 8 PM"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-sunken border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-foreground">Baseline Metric</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 72% current consistency"
                  value={baselineMetric}
                  onChange={(e) => setBaselineMetric(e.target.value)}
                  className="w-full bg-surface-sunken border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground">Hypothesis / Theory</label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Completing DSA Practice directly after dinner at 8 PM will raise consistency above 80%..."
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                className="w-full bg-surface-sunken border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-foreground">Duration (Days)</label>
                <input
                  type="number"
                  required
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-surface-sunken border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-foreground">Target Value (%)</label>
                <input
                  type="number"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full bg-surface-sunken border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-muted hover:bg-muted text-muted-foreground font-bold py-2 rounded-xl text-center cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary hover:bg-primary-hover text-foreground font-bold py-2 rounded-xl text-center cursor-pointer transition-colors disabled:opacity-50"
              >
                {submitting ? 'Initiating...' : 'Launch Test'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Experiments list */}
      {loading ? (
        <div className="h-20 bg-muted/20 animate-pulse rounded-2xl" />
      ) : experiments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-card flex items-center justify-center text-2xl border border-border/10">🧪</div>
          <div>
            <p className="text-sm font-extrabold text-foreground">No active experiments</p>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
              Hypotheses tests allow you to observe if timing shifts, difficulty target adjustments, or context changes actually improve consistency.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {experiments.map((exp) => (
            <Card
              key={exp.id}
              className={`bg-card border rounded-card p-5 flex flex-col justify-between gap-4 transition-colors ${
                exp.status === 'active'
                  ? 'border-primary/20 hover:border-primary/45 shadow-sm'
                  : 'border-border/10 opacity-70'
              }`}
            >
              <div className="space-y-1.5 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-foreground text-sm font-extrabold truncate max-w-[200px]">
                    {exp.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                    exp.status === 'active'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : exp.status === 'completed'
                      ? 'bg-success/15 text-success border border-success/20'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {exp.status}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Window: {exp.startDate} to {exp.endDate} ({exp.durationDays}d)
                </p>
                <div className="py-2.5 border-t border-b border-border/5 text-muted-foreground font-medium leading-relaxed">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Hypothesis</span>
                  {exp.hypothesis}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Baseline: <strong className="text-foreground">{exp.baselineMetric}</strong></span>
                  <span>Target: <strong className="text-primary font-bold">{exp.targetValue}%</strong></span>
                </div>
              </div>

              {exp.status === 'active' && (
                <div className="flex items-center gap-2 pt-2 text-xs font-bold">
                  <button
                    onClick={() => handleUpdateStatus(exp.id!, 'completed', 'Hypothesis supported by test.')}
                    className="flex-1 bg-success/15 border border-success/20 text-success hover:bg-success/25 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Complete</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(exp.id!, 'discarded', 'Hypothesis rejected or test halted.')}
                    className="flex-1 bg-muted hover:bg-muted text-muted-foreground py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors border border-white/5"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    <span>Discard</span>
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
