import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { analyticsService } from '@/services/analyticsService';
import { AnalyticsOverviewResponse } from '@/types/habitIntelligence';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GrowthDashboard } from './GrowthDashboard';
import { MomentumDashboard } from './MomentumDashboard';
import { MilestonesDashboard } from './MilestonesDashboard';
import { ForgeScoreModal } from '@/features/analytics/components/ForgeScoreModal';
import { HabitDrilldownModal } from '@/features/analytics/components/HabitDrilldownModal';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
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

type AnalyticsRange = '7d' | '30d' | '90d' | '1y' | 'all';

export const AnalyticsPage: React.FC = () => {
  useDocumentTitle('DailyForge — Performance Intelligence');
  const { error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isForgeScoreModalOpen, setIsForgeScoreModalOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);

  // Active trend metric toggle
  const [activeMetric, setActiveMetric] = useState<'completion' | 'consistency' | 'execution' | 'reliability'>('completion');

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getAnalyticsOverview(range);
      setData(res);
    } catch {
      error('Failed to load metrics', 'Could not load habit intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'overview') {
      fetchAnalyticsData();
    }
  }, [range, currentTab]);

  // If viewing Growth, Momentum, or Milestones tabs
  if (currentTab === 'growth') {
    return <GrowthDashboard />;
  }
  if (currentTab === 'momentum') {
    return <MomentumDashboard />;
  }
  if (currentTab === 'milestones') {
    return <MilestonesDashboard />;
  }

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
        <div className="h-72 bg-muted/20 rounded-2xl" />
      </div>
    );
  }

  const { metrics, forgeScoreBreakdown, trendPoints, habitReliability, timeOfDayAnalysis, weeklyPattern, strongestDay, weakestDay, actionableInsight } = data!;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in pb-12">
      {/* Header */}
      <PageHeader
        title="Analytics"
        description="Understand what is working, what is slipping, and where patterns are strongest."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex bg-card p-1 border border-border rounded-xl text-xs font-bold text-muted-foreground">
              {(['7d', '30d', '90d', '1y', 'all'] as const).map((r) => (
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
              onClick={() => navigate('/analytics?tab=growth')}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface-elevated hover:bg-muted border border-border text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <span>Growth</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </button>
          </div>
        }
      />

      {/* 4 Primary Hero Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Consistency Index"
          value={`${metrics.consistency.rate}%`}
          subtext={`+${metrics.consistency.changePts}% vs previous period`}
          icon={Sparkles}
          accent="orange"
        />
        <MetricCard
          title="Execution Rate"
          value={`${metrics.execution.rate}%`}
          subtext="Completed vs scheduled routines"
          icon={CheckCircle2}
          accent="green"
        />
        <MetricCard
          title="Reliability Index"
          value={`${metrics.reliability.rate}%`}
          subtext="Probability of routine completion"
          icon={Zap}
          accent="blue"
        />

        {/* Forge Score Card with Clickable Explainer */}
        <Card
          onClick={() => setIsForgeScoreModalOpen(true)}
          className="p-5 flex flex-col justify-between bg-card border border-border hover:border-primary/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">
              Forge Score
            </span>
            <Info className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground tracking-tight">
              {metrics.forgeScore.value}
            </p>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              +{metrics.forgeScore.changePts} pts · Composite execution power
            </p>
          </div>
        </Card>
      </div>

      {/* Performance Trend Area Chart with Metric Toggles */}
      <ChartCard
        title="Performance Trend"
        description="Daily routine execution, consistency, and reliability velocity"
        actions={
          <div className="flex bg-surface-sunken p-1 rounded-xl border border-border/80 text-[11px] font-bold text-muted-foreground">
            {(['completion', 'consistency', 'execution', 'reliability'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={cn(
                  'px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer select-none',
                  activeMetric === m ? 'bg-primary text-white font-extrabold shadow-sm' : 'hover:text-foreground'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        }
      >
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendPoints}>
              <defs>
                <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[40, 100]} />
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
                dataKey={activeMetric}
                stroke="#F97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#analyticsGradient)"
                name={activeMetric.toUpperCase()}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Habit Reliability Table + Friction Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Habit Reliability Table (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">Habit Reliability</h3>
                <p className="text-xs text-muted-foreground">Individual routine execution probabilities</p>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">Click to drill down</span>
            </div>

            <div className="space-y-2.5">
              {habitReliability.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => {
                    setSelectedHabitId(habit.id);
                    setIsDrilldownOpen(true);
                  }}
                  className="p-3 bg-surface-elevated/70 border border-border/70 hover:border-primary/50 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold transition-all cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-extrabold truncate group-hover:text-primary transition-colors">
                        {habit.name}
                      </span>
                      <span className={cn(
                        'text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase',
                        habit.risk === 'Stable' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        habit.risk === 'Watch' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      )}>
                        {habit.risk}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Streak: {habit.currentStreak}d • {habit.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 hidden sm:block">
                      <ProgressBar value={habit.reliability} />
                    </div>
                    <span className="font-mono text-primary font-extrabold text-sm w-10 text-right">
                      {habit.reliability}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Habit Friction Breakdown Card (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-foreground">Habit Friction</h3>
              <p className="text-xs text-muted-foreground">Difficulty maintaining routine vs planned schedule</p>
            </div>

            <div className="space-y-2.5">
              {habitReliability.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setSelectedHabitId(h.id);
                    setIsDrilldownOpen(true);
                  }}
                  className="p-3 bg-surface-elevated/70 border border-border/70 hover:border-primary/50 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold cursor-pointer transition-all"
                >
                  <div>
                    <span className="text-foreground font-bold block">{h.name}</span>
                    <span className="text-[10px] text-muted-foreground">{h.preferredTime}</span>
                  </div>
                  <span className={cn(
                    'text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase',
                    h.frictionLevel === 'Low' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                    h.frictionLevel === 'Medium' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' :
                    'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  )}>
                    {h.frictionLevel} ({h.frictionScore}%)
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Peak Windows & Time of Day Analysis + Weekly Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Time of Day Analysis */}
        <Card className="bg-card border border-border rounded-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Time-of-Day Success</h3>
            <p className="text-xs text-muted-foreground">Execution rates by circadian block</p>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            {timeOfDayAnalysis.map((item) => (
              <div key={item.window} className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>{item.window} ({item.hours})</span>
                  <span className="text-primary font-bold">{item.successRate}%</span>
                </div>
                <ProgressBar value={item.successRate} />
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Pattern Analysis */}
        <Card className="bg-card border border-border rounded-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Weekly Pattern</h3>
            <p className="text-xs text-muted-foreground">Day-of-week performance trends</p>
          </div>

          <div className="space-y-2 text-xs font-semibold">
            {weeklyPattern.map((p) => (
              <div key={p.day} className="flex items-center justify-between p-2 rounded-lg bg-surface-sunken">
                <span className="text-foreground font-bold">{p.dayName}</span>
                <span className={cn(
                  'font-mono font-bold',
                  p.successRate >= 90 ? 'text-emerald-400' : p.successRate < 75 ? 'text-rose-400' : 'text-slate-300'
                )}>
                  {p.successRate}%
                </span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-bold">
            <span className="text-emerald-400">Peak: {strongestDay.name} ({strongestDay.rate}%)</span>
            <span className="text-rose-400">Drop: {weakestDay.name} ({weakestDay.rate}%)</span>
          </div>
        </Card>

        {/* Actionable Intelligence Insight Card */}
        <Card className="bg-card border border-border rounded-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
              <Sparkles className="h-4 w-4" />
              <span>Actionable Insight</span>
            </div>
            <h4 className="text-base font-extrabold text-foreground leading-tight">
              {actionableInsight.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {actionableInsight.description}
            </p>
          </div>

          <button
            onClick={() => navigate('/planner')}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <span>{actionableInsight.suggestedAction}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Card>
      </div>

      {/* Modals */}
      <ForgeScoreModal
        isOpen={isForgeScoreModalOpen}
        onClose={() => setIsForgeScoreModalOpen(false)}
        breakdown={forgeScoreBreakdown}
      />

      <HabitDrilldownModal
        isOpen={isDrilldownOpen}
        onClose={() => {
          setIsDrilldownOpen(false);
          setSelectedHabitId(null);
        }}
        habitId={selectedHabitId}
      />
    </div>
  );
};
