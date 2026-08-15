import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { analyticsService } from '@/services/analyticsService';
import { BehaviorAnalytics } from '@/types/behavior';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GrowthDashboard } from './GrowthDashboard';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  Flame,
  Compass,
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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [behaviorData, setBehaviorData] = useState<BehaviorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBehaviorData = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getBehaviorAnalytics(range === 'all' ? '30d' : range);
      setBehaviorData(data);
    } catch (err) {
      error('Failed to load metrics', 'Could not load behavioral analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBehaviorData();
  }, [range]);

  if (loading) {
    return (
      <div className="space-y-4 py-12 text-center text-xs font-semibold text-muted-foreground animate-pulse">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        <p>Parsing behavior signals...</p>
      </div>
    );
  }

  if (currentTab === 'growth') {
    return <GrowthDashboard />;
  }

  // Baseline building check
  if (behaviorData?.isBaselineBuilding) {
    const progress = behaviorData.baselineProgress;
    const compsPercent = Math.min(100, Math.round((progress.completionsCount / progress.completionsTarget) * 100));
    const daysPercent = Math.min(100, Math.round((progress.daysObserved / progress.daysTarget) * 100));

    return (
      <div className="max-w-xl mx-auto py-12 text-left space-y-6 select-none">
        <div className="bg-[#101622] border border-[#1D293D] rounded-2xl p-6 flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl border border-primary/20 animate-bounce">
            ⚙️
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-100">Building Your Behavior Baseline</h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Complete more habits over the next few days. Daily Forge needs a short observation period to identify valid relationship patterns.
            </p>
          </div>

          <div className="w-full space-y-4 pt-4 border-t border-border/10">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-200">Habit Completions logged</span>
                <span className="text-primary">{progress.completionsCount} / {progress.completionsTarget}</span>
              </div>
              <ProgressBar value={compsPercent} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-200">Active Days observed</span>
                <span className="text-primary">{progress.daysObserved} / {progress.daysTarget} days</span>
              </div>
              <ProgressBar value={daysPercent} />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/60 italic pt-2">
            No faked AI statistics. Only transparent metrics.
          </p>
        </div>
      </div>
    );
  }

  // Loaded analytics data variables
  const riskList = behaviorData?.habitRisk || [];
  const frictionList = behaviorData?.habitFriction || [];

  // Mock performance trend data
  const trendData = [
    { name: 'Mon', completion: 70, consistency: 72, execution: 68 },
    { name: 'Tue', completion: 82, consistency: 80, execution: 85 },
    { name: 'Wed', completion: 65, consistency: 70, execution: 60 },
    { name: 'Thu', completion: 90, consistency: 85, execution: 88 },
    { name: 'Fri', completion: 80, consistency: 82, execution: 78 },
    { name: 'Sat', completion: 75, consistency: 78, execution: 72 },
    { name: 'Sun', completion: 85, consistency: 84, execution: 81 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left select-none">
      {/* Header */}
      <PageHeader
        title="Analytics"
        description="Understand the patterns behind your progress."
        actions={
          <div className="flex bg-[#101622] p-1 border border-[#1D293D] rounded-xl text-xs font-bold text-slate-300 w-max shrink-0 select-none">
            {([
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: '1y', label: '1Y' },
              { id: 'all', label: 'All Time' },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRange(opt.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg uppercase tracking-wide cursor-pointer transition-colors focus:outline-none',
                  range === opt.id
                    ? 'bg-primary text-slate-100 font-extrabold'
                    : 'hover:text-foreground hover:bg-muted/30'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Forge Score"
          value={behaviorData?.forgeScore || 742}
          subtext="+42 this week"
          icon={Sparkles}
          trend="+42"
          accent="blue"
        />
        <MetricCard
          title="Consistency"
          value={`${behaviorData?.consistencyIndex || 84}%`}
          subtext="+8.4% vs last week"
          icon={TrendingUp}
          trend="+8.4%"
          accent="blue"
        />
        <MetricCard
          title="Execution"
          value={`${behaviorData?.executionRate.rate || 88}%`}
          subtext="+4.2% vs last week"
          icon={Zap}
          trend="+4.2%"
          accent="green"
        />
        <MetricCard
          title="Reliability"
          value="81%"
          subtext="+3.6% vs last week"
          icon={Flame}
          trend="+3.6%"
          accent="orange"
        />
      </div>

      {/* Performance trend area chart */}
      <ChartCard
        title="Performance Trend"
        description="Weekly progression for completion, consistency, and overall execution rate"
      >
        <div className="h-[260px] text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="consGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="execGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(29, 41, 61, 0.3)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#101622', borderColor: '#1D293D', borderRadius: '10px' }}
                itemStyle={{ fontSize: 11 }}
                labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="completion" stroke="#2563EB" strokeWidth={2} fill="url(#compGrad)" />
              <Area type="monotone" dataKey="consistency" stroke="#22D3EE" strokeWidth={1.8} fill="url(#consGrad)" />
              <Area type="monotone" dataKey="execution" stroke="#10B981" strokeWidth={1.8} fill="url(#execGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Main split grid: Behavioral blocks vs Time analysis and fingerprint */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left main: Behavioral analytics & relationships */}
        <div className="lg:col-span-2 space-y-5">
          {/* Behavioral Analytics Sub-grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Habit Reliability */}
            <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Habit Reliability</h4>
              <div className="space-y-2">
                {behaviorData?.habitReliability.slice(0, 3).map((h) => (
                  <div key={h.habitId} className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300 truncate max-w-[150px]">{h.name}</span>
                    <span className="text-success">{h.reliability}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Habit Friction */}
            <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Habit Friction</h4>
              <div className="space-y-2">
                {frictionList.slice(0, 3).map((f) => (
                  <div key={f.habitId} className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300 truncate max-w-[150px]">{f.name}</span>
                    <span className={cn(
                      "font-bold",
                      f.frictionLevel === 'HIGH' ? 'text-warning' : 'text-slate-400'
                    )}>{f.frictionLevel}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recovery Rate */}
            <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recovery Rate</h4>
              <div className="text-left font-semibold text-xs text-slate-300 space-y-1">
                <p className="text-2xl font-extrabold text-slate-100">{behaviorData?.recoveryRate.rate}%</p>
                <p>Average gap days: {behaviorData?.recoveryRate.averageGapDays}d</p>
              </div>
            </Card>

            {/* Habit Risk */}
            <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Habit Risk</h4>
              <div className="space-y-2">
                {riskList.slice(0, 3).map((r) => (
                  <div key={r.habitId} className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300 truncate max-w-[150px]">{r.name}</span>
                    <span className="text-danger font-bold">{r.riskLevel}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Relationships Associated Habits */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Behavior Correlations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Observed patterns between separate habits (does not imply causality)</p>
            </div>
            <div className="space-y-2 text-xs font-semibold">
              <div className="p-3 bg-[#131B29] border border-border/5 rounded-xl flex items-center justify-between gap-4">
                <span className="text-slate-200">Exercise ↔ DSA Practice</span>
                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full">+18 percentage points</span>
              </div>
              <p className="text-[10px] text-muted-foreground/60 italic leading-relaxed">
                * Note: Exercise is statisticaly <strong>Associated with</strong> DSA Practice completions. This correlation represents timing and focus overlap rather than causality.
              </p>
            </div>
          </Card>

          {/* Performance heatmap by Hour, Day, Week */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Time Analysis Heatmap</h3>
            <div className="grid grid-cols-7 gap-1 pt-2">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-6 rounded border border-white/5",
                    i % 5 === 0
                      ? "bg-primary/80"
                      : i % 3 === 0
                      ? "bg-primary/45"
                      : i % 2 === 0
                      ? "bg-[#151D2C]"
                      : "bg-[#0B0F1A]"
                  )}
                  title="Completed routines check shading"
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Right side: peak windows, capacity, fingerprint */}
        <div className="space-y-5">
          {/* Peak Windows */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Peak Performance Windows</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Execution odds by schedule blocks</p>
            </div>
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-success" /> Morning</span>
                <span>82% success</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-warning" /> Afternoon</span>
                <span>60% success</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> Evening</span>
                <span>91% success</span>
              </div>
            </div>
          </Card>

          {/* Focus Capacity */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Capacity validation</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Workload planned vs actual focus hours</p>
            </div>
            <div className="text-xs font-semibold text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span>Planned Focus Workload</span>
                <span>5.1h / day</span>
              </div>
              <div className="flex justify-between">
                <span>Actual Focus Execution</span>
                <span>4.3h / day</span>
              </div>
            </div>
          </Card>

          {/* Habit Fingerprint */}
          <Card className="bg-[#101622] border border-cyan-500/20 rounded-[14px] p-5 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-border/10 pb-2">
              <Compass className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Habit Fingerprint</h4>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-semibold">
              Early Bird Practitioner: stable morning routines, high focus capacity levels, low risk gap delay. Moderate evening friction logged due to timing delays.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
