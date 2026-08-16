import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { analyticsService } from '@/services/analyticsService';
import { GrowthOverviewResponse } from '@/types/habitIntelligence';
import {
  TrendingUp,
  Sparkles,
  Zap,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/utils/cn';

export const GrowthDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState<'30d' | '90d' | '6m' | '1y'>('90d');
  const [data, setData] = useState<GrowthOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGrowth = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getGrowthOverview(range);
      setData(res);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowth();
  }, [range]);

  if (loading && !data) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto text-left select-none animate-pulse">
        <div className="h-10 bg-muted/20 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-muted/20 rounded-2xl" />
          <div className="h-28 bg-muted/20 rounded-2xl" />
          <div className="h-28 bg-muted/20 rounded-2xl" />
          <div className="h-28 bg-muted/20 rounded-2xl" />
        </div>
        <div className="h-72 bg-muted/20 rounded-2xl" />
      </div>
    );
  }

  const { heroMetrics, baseline, growthTrend, beforeVsNow, personalRecords, habitMaturity, compoundingProgression } = data!;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in pb-12">
      {/* Header */}
      <PageHeader
        title="Growth"
        description="See how your behavior compounds over time."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex bg-card p-1 border border-border rounded-xl text-xs font-bold text-muted-foreground">
              {(['30d', '90d', '6m', '1y'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    'px-3 py-1 rounded-lg uppercase tracking-wider transition-all cursor-pointer select-none',
                    range === r ? 'bg-primary text-white font-extrabold shadow-sm' : 'hover:text-foreground'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/analytics?tab=momentum')}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface-elevated hover:bg-muted border border-border text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <span>Momentum</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </button>
          </div>
        }
      />

      {/* Top Growth Hero Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="30-Day Growth"
          value={heroMetrics.thirtyDayGrowth}
          subtext="Recent improvement"
          icon={TrendingUp}
          accent="blue"
        />
        <MetricCard
          title="90-Day Growth"
          value={heroMetrics.ninetyDayGrowth}
          subtext="Long-term trajectory"
          icon={TrendingUp}
          accent="blue"
        />
        <MetricCard
          title="Consistency Growth"
          value={heroMetrics.consistencyGrowth}
          subtext="Routine stability"
          icon={Sparkles}
          accent="green"
        />
        <MetricCard
          title="Execution Growth"
          value={heroMetrics.executionGrowth}
          subtext="Planned routine execution"
          icon={Zap}
          accent="orange"
        />
      </div>

      {/* Baseline Card + Long Term Progression Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Baseline System Card */}
        <Card className="bg-card border border-border rounded-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block">
              Personal Baseline
            </span>
            <h3 className="text-lg font-extrabold text-foreground">Baseline vs Current</h3>
            <p className="text-xs text-muted-foreground font-semibold">
              Established: <strong className="text-foreground">{baseline.establishedDate}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-sunken border border-border/80 space-y-3 text-xs font-semibold">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Initial Consistency:</span>
              <strong className="text-foreground font-extrabold">{baseline.initialConsistency}%</strong>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Current Consistency:</span>
              <strong className="text-primary font-extrabold">{baseline.currentConsistency}%</strong>
            </div>
            <div className="pt-2 border-t border-border/60 flex justify-between items-center">
              <span className="text-foreground font-bold">Net Improvement:</span>
              <span className="text-emerald-400 font-mono font-black text-sm">+{baseline.improvementPts} pts</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
            Your execution capacity has expanded by +{baseline.improvementPts} percentage points since baseline establishment.
          </p>
        </Card>

        {/* Long Term Growth Chart with Baseline Reference Line */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Long-Term Growth Progression"
            description="Comparing monthly consistency against baseline reference"
          >
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1527',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <ReferenceLine y={baseline.initialConsistency} stroke="#64748B" strokeDasharray="4 4" label={{ value: `Baseline: ${baseline.initialConsistency}%`, fill: '#94A3B8', fontSize: 10 }} />
                  <Line type="monotone" dataKey="consistency" stroke="#F97316" strokeWidth={3} dot={{ r: 4, fill: '#F97316' }} activeDot={{ r: 6 }} name="Consistency" />
                  <Line type="monotone" dataKey="execution" stroke="#10B981" strokeWidth={2} strokeDasharray="3 3" name="Execution" />
                  <Line type="monotone" dataKey="recovery" stroke="#3B82F6" strokeWidth={2} name="Recovery" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Before vs Now + Personal Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Before vs Now Comparison Matrix */}
        <Card className="bg-card border border-border rounded-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Before vs Now</h3>
            <p className="text-xs text-muted-foreground">Historical starting point compared to current standard</p>
          </div>

          <div className="space-y-2 text-xs font-semibold">
            {beforeVsNow.map((row, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-surface-elevated/70 border border-border/70 flex items-center justify-between gap-3"
              >
                <span className="text-foreground font-bold">{row.metric}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{row.before}</span>
                  <span className="text-muted-foreground/60">→</span>
                  <span className="text-foreground font-extrabold">{row.now}</span>
                  <span className="text-emerald-400 font-mono font-bold text-[11px] min-w-16 text-right">
                    {row.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Personal Records */}
        <Card className="bg-card border border-border rounded-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Personal Records</h3>
            <p className="text-xs text-muted-foreground">Milestone achievements and peak lifetime performances</p>
          </div>

          <div className="space-y-2.5">
            {personalRecords.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-surface-elevated/70 border border-border/70 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="text-foreground font-extrabold block truncate leading-tight">
                    {rec.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {rec.subtitle}
                  </span>
                </div>
                <span className="text-primary font-mono font-black text-sm shrink-0">
                  {rec.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Habit Maturity Matrix & Habit Growth Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Habit Maturity Matrix */}
        <Card className="bg-card border border-border rounded-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Habit Maturity Classification</h3>
            <p className="text-xs text-muted-foreground">Progression through behavioral lifecycle stages</p>
          </div>

          <div className="space-y-3">
            {habitMaturity.map((h) => (
              <div key={h.id} className="p-3 rounded-xl bg-surface-elevated border border-border/70 space-y-2 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-bold">{h.name}</span>
                  <span className={cn(
                    'text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase',
                    h.stage === 'AUTOMATED' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                    h.stage === 'ESTABLISHED' ? 'bg-primary/15 border-primary/30 text-primary' :
                    h.stage === 'BUILDING' ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' :
                    'bg-muted border-border text-muted-foreground'
                  )}>
                    {h.stage} ({h.label})
                  </span>
                </div>
                <ProgressBar value={h.progress} />
              </div>
            ))}
          </div>
        </Card>

        {/* Consistency Compounding View */}
        <Card className="bg-card border border-border rounded-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Consistency Compounding</h3>
            <p className="text-xs text-muted-foreground">How micro-habits compound into macro consistency</p>
          </div>

          <div className="space-y-2.5">
            {compoundingProgression.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-surface-sunken border border-border/70 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="text-foreground font-extrabold block">{item.week}</span>
                  <span className="text-[11px] text-muted-foreground font-medium">{item.text}</span>
                </div>
                <span className="text-primary font-mono font-extrabold text-sm">{item.rate}%</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed italic border-t border-border/60 pt-3">
            &quot;Small improvements in daily execution are compounding into stronger weekly consistency.&quot;
          </p>
        </Card>
      </div>
    </div>
  );
};
