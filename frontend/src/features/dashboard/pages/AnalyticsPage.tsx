import React, { useEffect, useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { analyticsService } from '@/services/analyticsService';
import { BehaviorAnalytics } from '@/types/behavior';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import {
  Zap,
  TrendingUp,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  useDocumentTitle('DailyForge — Performance Intelligence');
  const { error } = useToast();
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [behaviorData, setBehaviorData] = useState<BehaviorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBehaviorData = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getBehaviorAnalytics(range);
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

  // 1. Render empty baseline building state if insufficient data
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
            {/* Completions progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-200">Habit Completions logged</span>
                <span className="text-primary">{progress.completionsCount} / {progress.completionsTarget}</span>
              </div>
              <div className="h-2 w-full bg-[#151D2C] rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${compsPercent}%` }} />
              </div>
            </div>

            {/* Days observed progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-200">Active Days observed</span>
                <span className="text-primary">{progress.daysObserved} / {progress.daysTarget} days</span>
              </div>
              <div className="h-2 w-full bg-[#151D2C] rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${daysPercent}%` }} />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/60 italic pt-2">
            No faked AI statistics. Only transparent metrics.
          </p>
        </div>
      </div>
    );
  }

  // Loaded analytics dashboard
  const wins = behaviorData?.weeklyReview.wins || [];
  const challenges = behaviorData?.weeklyReview.challenges || [];
  const recs = behaviorData?.weeklyReview.recommendations || [];
  const peakData = behaviorData?.peakWindows || [];
  const correlations = behaviorData?.habitRelationships || [];
  const keystones = behaviorData?.keystoneHabits || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left select-none">
      {/* Header and selector */}
      <div className="border-b border-border/40 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            Performance Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-semibold">
            Analyzed logs from the last {range === '7d' ? '7' : range === '30d' ? '30' : '90'} days.
          </p>
        </div>
        <div className="flex bg-[#101622] p-1 border border-[#1D293D] rounded-xl text-xs font-bold text-slate-300 w-max shrink-0">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wide cursor-pointer transition-colors ${
                range === r ? 'bg-primary text-slate-100 font-extrabold' : 'hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left main: Insights & Weekly Review summaries */}
        <div className="md:col-span-2 space-y-5">
          {/* Wins and Challenges */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Wins & Challenges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 border-r border-border/5 pr-2">
                <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">WINS</span>
                <ul className="space-y-1.5 list-disc list-inside text-slate-200">
                  {wins.map((w, i) => (
                    <li key={i} className="truncate">{w}</li>
                  ))}
                  {wins.length === 0 && <li className="text-muted-foreground">Building wins baseline...</li>}
                </ul>
              </div>
              <div className="space-y-2 pl-2">
                <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider">CHALLENGES</span>
                <ul className="space-y-1.5 list-disc list-inside text-slate-200">
                  {challenges.map((c, i) => (
                    <li key={i} className="truncate">{c}</li>
                  ))}
                  {challenges.length === 0 && <li className="text-muted-foreground">No critical challenges detected.</li>}
                </ul>
              </div>
            </div>
          </Card>

          {/* Correlations & keystones */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Keystone Habits & Correlations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Statistical overlaps between separate routine completions</p>
            </div>
            <div className="space-y-3">
              {correlations.map((c, i) => (
                <div key={i} className="p-3 bg-[#131B29] border border-border/5 rounded-xl text-xs font-semibold flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span className="text-slate-200">{c.description}</span>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase shrink-0">
                    +{c.correlation}% Correlation
                  </span>
                </div>
              ))}
              {keystones.map((k) => (
                <div key={k.habitId} className="p-3 bg-primary/5 border border-primary/15 rounded-xl text-xs font-semibold flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span>
                      <strong className="text-primary font-extrabold">{k.name}</strong> is a Keystone Habit. Completing it increases overall checklist completion by <strong className="text-success font-extrabold">+{k.impactScore}%</strong>.
                    </span>
                  </div>
                </div>
              ))}
              {correlations.length === 0 && keystones.length === 0 && (
                <p className="text-xs text-muted-foreground/60 py-6 text-center italic">
                  Not enough overlapping completion days to observe habit correlations.
                </p>
              )}
            </div>
          </Card>

          {/* Peak Windows bars */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Peak Performance Windows</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Success rates by time blocks</p>
            </div>
            <div className="h-[180px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(29, 41, 61, 0.3)" vertical={false} />
                  <XAxis dataKey="window" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#101622', borderColor: '#1D293D', borderRadius: '10px' }}
                    itemStyle={{ fontSize: 11 }}
                    labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="percentage" name="Completion Rate (%)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right side: momentum, recovery, and recommendations */}
        <div className="space-y-5">
          {/* Momentum Indicator */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 flex flex-col justify-between h-[180px]">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Momentum Status</span>
              <h3 className="text-2xl font-extrabold text-foreground tracking-tight mt-1">
                {behaviorData?.momentum.status}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              <span className="text-xs font-semibold text-slate-300">
                {behaviorData?.momentum.trend && behaviorData.momentum.trend > 0 ? '+' : ''}
                {behaviorData?.momentum.trend}% vs baseline
              </span>
            </div>
          </Card>

          {/* Recovery rate dial */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recovery Index</h4>
              <p className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
                {behaviorData?.recoveryRate.rate}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Average recovery: <strong className="text-foreground">{behaviorData?.recoveryRate.averageGapDays} days</strong>
              </p>
            </div>
          </Card>

          {/* Recommendations checklist */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Behavior Recommendations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Data-driven workflow suggestions</p>
            </div>
            <div className="space-y-2">
              {recs.map((rec, i) => (
                <div key={i} className="p-3 bg-[#131B29] border border-border/5 rounded-xl text-xs font-semibold text-slate-200">
                  <p>{rec.text}</p>
                </div>
              ))}
              {recs.length === 0 && (
                <p className="text-xs text-muted-foreground/60 py-6 text-center italic">
                  Keep building consistency. Recommendations will populate shortly.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
