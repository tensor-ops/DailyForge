import React, { useEffect, useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { MetricCard } from '@/components/ui/MetricCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { experimentService } from '@/services/experimentService';
import {
  ForgeLabOverviewResponse,
  ExperimentTemplate,
} from '@/types/experiment';
import { ExperimentBuilderModal } from '@/features/forge-lab/components/ExperimentBuilderModal';
import { ExperimentDetailModal } from '@/features/forge-lab/components/ExperimentDetailModal';
import {
  Sparkles,
  Zap,
  Beaker,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const ForgeLabPage: React.FC = () => {
  useDocumentTitle('DailyForge — Forge Lab & Personal Experiments');
  const [data, setData] = useState<ForgeLabOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExperimentTemplate | null>(null);
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await experimentService.getOverview();
      setData(res);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto text-left select-none animate-pulse pb-12">
        <div className="h-10 bg-muted/20 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-muted/20 rounded-2xl" />
          <div className="h-28 bg-muted/20 rounded-2xl" />
          <div className="h-28 bg-muted/20 rounded-2xl" />
          <div className="h-28 bg-muted/20 rounded-2xl" />
        </div>
        <div className="h-64 bg-muted/20 rounded-2xl" />
      </div>
    );
  }

  const { heroMetrics, suggestedExperiment, activeExperiments, templates, history } = data!;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in pb-12">
      {/* Header */}
      <PageHeader
        title="Forge Lab"
        description="Run personal experiments on your routines. Learn what actually works for you."
        actions={
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setIsBuilderOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>New Experiment</span>
          </button>
        }
      />

      {/* Hero Summary Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Experiments"
          value={`${heroMetrics.activeExperiments}`}
          subtext="Currently running trials"
          icon={Beaker}
          accent="orange"
        />
        <MetricCard
          title="Completed Trials"
          value={`${heroMetrics.completedExperiments}`}
          subtext="Concluded behavior tests"
          icon={CheckCircle2}
          accent="blue"
        />
        <MetricCard
          title="Successful Optimizations"
          value={`${heroMetrics.successfulExperiments}`}
          subtext="Proven routine adjustments"
          icon={Award}
          accent="green"
        />
        <MetricCard
          title="Average Improvement"
          value={heroMetrics.averageImprovement}
          subtext="Observed consistency lift"
          icon={TrendingUp}
          accent="blue"
        />
      </div>

      {/* Smart Suggested Experiment Card with Evidence */}
      <Card className="bg-gradient-to-r from-[#111A30] to-[#0A1020] border border-primary/40 rounded-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </span>
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">
              Suggested Experiment · Backed by Analytics Evidence
            </span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground font-mono">
            {suggestedExperiment.habitName}
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold text-foreground">
            {suggestedExperiment.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            &quot;{suggestedExperiment.hypothesis}&quot;
          </p>
        </div>

        <div className="p-3 rounded-xl bg-surface-sunken border border-border/70 text-xs flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-300 font-semibold leading-snug">
            💡 <strong>Evidence:</strong> {suggestedExperiment.evidence}
          </p>
          <button
            onClick={() => {
              setSelectedTemplate({
                id: 'SUGGESTED',
                title: suggestedExperiment.title,
                category: 'SCHEDULE_TIME',
                description: suggestedExperiment.hypothesis,
                defaultDuration: 14,
                defaultTargetImprovement: 10,
                icon: 'Zap',
              });
              setIsBuilderOpen(true);
            }}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            Run Experiment
          </button>
        </div>
      </Card>

      {/* Active Experiments Grid */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
            <Beaker className="h-4 w-4 text-primary" />
            <span>Active Trials ({activeExperiments.length})</span>
          </h3>
          <span className="text-[10px] text-muted-foreground font-semibold">
            N-of-1 Behavior Trials
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeExperiments.map((exp) => (
            <Card
              key={exp.id || exp._id}
              className="bg-card border border-border hover:border-primary/50 transition-all rounded-card p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest block">
                      {exp.category} Trial · Day {exp.dayProgress} of {exp.durationDays}
                    </span>
                    <h4 className="text-sm font-extrabold text-foreground leading-snug">
                      {exp.name}
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wider bg-primary/15 text-primary border border-primary/30 shrink-0">
                    {exp.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  &quot;{exp.hypothesis}&quot;
                </p>

                {/* 3-Column Delta Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-surface-sunken border border-border/80 text-center">
                  <div>
                    <span className="text-[9px] text-muted-foreground font-bold block uppercase">
                      Baseline
                    </span>
                    <span className="text-base font-extrabold text-foreground block mt-0.5">
                      {exp.baselineValue}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-primary font-bold block uppercase">
                      Current
                    </span>
                    <span className="text-base font-extrabold text-primary block mt-0.5">
                      {exp.currentValue}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-400 font-bold block uppercase">
                      Target
                    </span>
                    <span className="text-base font-extrabold text-emerald-400 block mt-0.5">
                      {exp.targetValue}%
                    </span>
                  </div>
                </div>

                {/* Progress bar towards target */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                    <span className="text-emerald-400 font-bold font-mono">
                      +{exp.improvementPts || 9} pts improvement
                    </span>
                    <span>{exp.durationDays - exp.dayProgress} days left</span>
                  </div>
                  <ProgressBar value={Math.min(100, Math.round(((exp.currentValue - exp.baselineValue) / (exp.targetValue - exp.baselineValue || 8)) * 100))} />
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-semibold">
                  Habit: <strong className="text-foreground">{exp.habitName}</strong>
                </span>
                <button
                  onClick={() => {
                    setSelectedExperimentId(exp.id || exp._id || '');
                    setIsDetailOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-surface-elevated hover:bg-muted border border-border text-foreground text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Trial Workspace</span>
                  <ArrowRight className="h-3 w-3 text-primary" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Experiment Templates Section */}
      <Card className="bg-card border border-border rounded-card p-5 space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Experiment Templates</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Proven behavioral trial methodologies to optimize daily routines
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                setSelectedTemplate(tpl);
                setIsBuilderOpen(true);
              }}
              className="p-4 rounded-2xl bg-surface-elevated/70 border border-border/70 hover:border-primary/50 transition-all flex flex-col justify-between gap-3 cursor-pointer group shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">
                    {tpl.title}
                  </span>
                  <Zap className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                <span>{tpl.defaultDuration} Days Trial</span>
                <span className="text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  <span>Use Template</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Experiment History Table */}
      <Card className="bg-card border border-border rounded-card p-5 space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-foreground">Experiment History</h3>
          <p className="text-xs text-muted-foreground">Concluded behavior trials and optimization lineage</p>
        </div>

        <div className="space-y-2.5">
          {history.map((item) => (
            <div
              key={item.id || item._id}
              onClick={() => {
                setSelectedExperimentId(item.id || item._id || '');
                setIsDetailOpen(true);
              }}
              className="p-3 rounded-xl bg-surface-elevated/70 border border-border/70 hover:border-primary/40 flex items-center justify-between gap-3 text-xs font-semibold cursor-pointer transition-all"
            >
              <div className="min-w-0 flex-1">
                <span className="text-foreground font-bold block truncate">{item.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {item.habitName} • {item.durationDays} days
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-emerald-400 font-bold">
                  +{item.improvementPts || 12} pts
                </span>
                <span
                  className={cn(
                    'text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase',
                    item.status === 'SUCCESSFUL' || item.isApplied
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-primary/15 border-primary/30 text-primary'
                  )}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modals */}
      <ExperimentBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setSelectedTemplate(null);
        }}
        initialTemplate={selectedTemplate}
        onSuccess={() => fetchOverview()}
      />

      <ExperimentDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedExperimentId(null);
        }}
        experimentId={selectedExperimentId}
        onSuccess={() => fetchOverview()}
      />
    </div>
  );
};
