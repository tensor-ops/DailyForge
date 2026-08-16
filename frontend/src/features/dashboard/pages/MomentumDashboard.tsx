import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { ChartCard } from '@/components/ui/ChartCard';
import { analyticsService } from '@/services/analyticsService';
import { MomentumOverviewResponse } from '@/types/habitIntelligence';
import { ArrowRight } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { cn } from '@/utils/cn';

export const MomentumDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [data, setData] = useState<MomentumOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMomentum = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getMomentumOverview(range);
      setData(res);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMomentum();
  }, [range]);

  if (loading && !data) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto text-left select-none animate-pulse">
        <div className="h-10 bg-muted/20 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 h-36 bg-muted/20 rounded-2xl" />
          <div className="h-36 bg-muted/20 rounded-2xl" />
          <div className="h-36 bg-muted/20 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { hero, trajectory, positiveDrivers, slowingFactors, streakHealth, recovery, atRiskHabits, actionPlan } = data!;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in pb-12">
      {/* Header */}
      <PageHeader
        title="Momentum"
        description="Where is your routine behavior heading right now?"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex bg-card p-1 border border-border rounded-xl text-xs font-bold text-muted-foreground">
              {(['7d', '30d', '90d'] as const).map((r) => (
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
              onClick={() => navigate('/planner')}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface-elevated hover:bg-muted border border-border text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <span>Planner</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </button>
          </div>
        }
      />

      {/* Hero Metric & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Large Momentum Hero Metric Card */}
        <Card className="p-5 flex flex-col justify-between h-full md:col-span-2 bg-card border border-border rounded-card">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">
              Momentum Trajectory Score
            </span>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-black text-foreground tracking-tight">{hero.score}</p>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {hero.trend}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold pt-1">
              {hero.explanation}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-4 border-t border-border/60 mt-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Velocity Status:
            </span>
            <span className="px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
              {hero.status}
            </span>
          </div>
        </Card>

        {/* Recovery Stats Card */}
        <Card className="p-5 flex flex-col justify-between h-full bg-card border border-border rounded-card">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
            Recovery Speed
          </span>
          <div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">
              {recovery.averageRecoveryDays} days
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
              Recovery success rate: <strong className="text-emerald-400 font-mono">{recovery.recoveryRate}</strong>
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground/80 leading-snug border-t border-border/60 pt-2">
            Average return interval after a disruption.
          </p>
        </Card>

        {/* Streak Stability Card */}
        <Card className="p-5 flex flex-col justify-between h-full bg-card border border-border rounded-card">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
            Streak Stability
          </span>
          <div>
            <p className="text-3xl font-extrabold text-primary tracking-tight">
              {streakHealth.currentStreak}d
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
              Stability rating: <strong className="text-foreground">{streakHealth.stabilityScore}%</strong>
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground/80 leading-snug border-t border-border/60 pt-2">
            Longest active streak: <strong className="text-foreground font-mono">{streakHealth.longestStreak}d</strong>
          </p>
        </Card>
      </div>

      {/* Momentum Trajectory Area Chart */}
      <ChartCard
        title="Momentum Acceleration Curve"
        description="Weekly behavior acceleration and consistency velocity"
      >
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectory}>
              <defs>
                <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="momentum"
                stroke="#F97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#momentumGradient)"
                name="Momentum"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Momentum Drivers vs Slowing Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Positive Drivers */}
        <Card className="bg-card border border-border rounded-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">What is Driving Your Momentum?</h3>
            <p className="text-xs text-muted-foreground">High-consistency routines accelerating your score</p>
          </div>

          <div className="space-y-2.5">
            {positiveDrivers.map((driver, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-surface-elevated/70 border border-border/70 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="text-foreground font-extrabold block truncate">
                    {driver.item}
                  </span>
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {driver.reason}
                  </span>
                </div>
                <span className="text-emerald-400 font-mono font-extrabold text-sm shrink-0">
                  {driver.delta}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Slowing Factors */}
        <Card className="bg-card border border-border rounded-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">What is Slowing You Down?</h3>
            <p className="text-xs text-muted-foreground">Friction areas and schedule drop-offs reducing velocity</p>
          </div>

          <div className="space-y-2.5">
            {slowingFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-surface-elevated/70 border border-border/70 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="text-foreground font-extrabold block truncate">
                    {factor.item}
                  </span>
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {factor.reason}
                  </span>
                </div>
                <span className="text-rose-400 font-mono font-extrabold text-sm shrink-0">
                  {factor.delta}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* At Risk Habits & Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* At-Risk Habits Section */}
        <Card className="bg-card border border-border rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-foreground">At-Risk Habits</h3>
              <p className="text-xs text-muted-foreground">Routines exhibiting recent reliability decline</p>
            </div>
            <span className="text-[10px] font-bold bg-danger/15 text-danger border border-danger/30 px-2 py-0.5 rounded-full">
              {atRiskHabits.length} Warning
            </span>
          </div>

          <div className="space-y-2.5">
            {atRiskHabits.map((habit) => (
              <div
                key={habit.id}
                className="p-3.5 rounded-2xl bg-surface-sunken border border-danger/25 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-extrabold">{habit.name}</span>
                  <span className="text-danger font-mono font-bold text-[11px]">{habit.trend}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Cause: <strong className="text-slate-300">{habit.cause}</strong>
                </p>
                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-primary font-bold">{habit.recommendation}</span>
                  <button
                    onClick={() => navigate('/planner')}
                    className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer shrink-0"
                  >
                    Fix in Planner
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Momentum Next Best Actions */}
        <Card className="bg-card border border-border rounded-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Next Best Actions</h3>
            <p className="text-xs text-muted-foreground">Recommended tactical steps to preserve momentum</p>
          </div>

          <div className="space-y-2.5">
            {actionPlan.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-surface-elevated/70 border border-border/70 flex items-start gap-2.5 text-xs font-semibold"
              >
                <span className="h-5 w-5 rounded-md bg-primary/15 text-primary flex items-center justify-center font-bold shrink-0 text-[10px] mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-foreground leading-snug flex-1">{step.action}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Want AI Coach guidance?</span>
            <button
              onClick={() => navigate('/ai-insights?tab=coach')}
              className="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Consult AI Coach</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
