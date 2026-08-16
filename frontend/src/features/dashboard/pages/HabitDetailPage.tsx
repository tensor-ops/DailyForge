import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { habitService } from '@/services/habitService';
import { Habit, HabitAnalytics } from '@/types/habit';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useToast } from '@/hooks/useToast';
import {
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Flame,
  Trophy,
  Clock,
  Target,
  ShieldCheck,
  Zap,
  Calendar,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const HabitDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error } = useToast();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [analytics, setAnalytics] = useState<HabitAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useDocumentTitle(habit ? `DailyForge — ${habit.name}` : 'Habit Detail');

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      try {
        const [fetchedHabit, fetchedAnalytics] = await Promise.all([
          habitService.getHabitById(id),
          habitService.getHabitAnalytics(id).catch(() => null),
        ]);
        setHabit(fetchedHabit);
        setAnalytics(fetchedAnalytics);
      } catch {
        error('Load failed', 'Unable to fetch habit details.');
        navigate('/habits');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id, navigate, error]);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground animate-pulse space-y-2">
        <div className="h-6 w-48 bg-muted/30 rounded mx-auto" />
        <p>Loading habit intelligence...</p>
      </div>
    );
  }

  if (!habit) return null;

  const reliability = analytics?.reliability ?? habit.completionRate ?? 80;
  const consistency = analytics?.consistency ?? habit.completionRate ?? 80;
  const currentStreak = analytics?.currentStreak ?? habit.currentStreak ?? 0;
  const longestStreak = analytics?.longestStreak ?? habit.longestStreak ?? 0;
  const friction = analytics?.friction ?? 'LOW';
  const stabilityRisk = analytics?.stabilityRisk ?? 'STABLE';
  const stabilityTrend = analytics?.stabilityTrend ?? 0;
  const bestTime = analytics?.bestTime || habit.preferredTime || 'Building baseline...';
  const progress = analytics?.progress ?? habit.completionRate ?? 80;
  const missReasons = analytics?.missReasons || [];
  const dailyTrend = analytics?.dailyTrend || [];
  const aiSuggestion =
    analytics?.aiSuggestion ||
    'Complete this habit for a few more days to unlock personalized behavioral recommendations.';

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left select-none pb-12">
      {/* Back navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-card hover:bg-surface-elevated border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Back to habits"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {habit.category}
              </span>
              <span className="text-xs text-muted-foreground font-medium capitalize">
                · {habit.frequency}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 tracking-tight">
              {habit.name}
            </h1>
            {habit.description && (
              <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        {/* Quick Meta Chips */}
        <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs font-semibold">
          {habit.preferredTime && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface border border-border text-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Preferred: {habit.preferredTime}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface border border-border text-foreground">
            <Target className="h-3.5 w-3.5 text-emerald-500" />
            <span>
              {habit.trackingType === 'binary'
                ? 'Binary Target'
                : `${habit.targetValue || 1} ${habit.unit || 'times'}`}
            </span>
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left column: Performance Snapshot, 14-Day Timeline, Friction Analysis */}
        <div className="lg:col-span-8 space-y-5">
          {/* Performance Snapshot */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Performance Snapshot</span>
              </h3>
              <span className="text-[11px] text-muted-foreground font-medium">
                All-time behavioral telemetry
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  Reliability Index
                </span>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">{reliability}%</p>
                <span className="text-[10px] text-muted-foreground">Scheduled adherence</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  Consistency Score
                </span>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">{consistency}%</p>
                <span className="text-[10px] text-muted-foreground">Weighted regularity</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  Friction Rating
                </span>
                <p
                  className={cn(
                    'text-2xl font-extrabold tracking-tight',
                    friction === 'HIGH'
                      ? 'text-warning font-bold'
                      : friction === 'MEDIUM'
                      ? 'text-blue-400'
                      : 'text-success font-bold'
                  )}
                >
                  {friction}
                </p>
                <span className="text-[10px] text-muted-foreground">Behavioral resistance</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  Current Streak
                </span>
                <p className="text-2xl font-extrabold text-warning tracking-tight flex items-center gap-1">
                  <Flame className="h-5 w-5 fill-warning shrink-0" />
                  <span>{currentStreak} Days</span>
                </p>
                <span className="text-[10px] text-muted-foreground">Active streak</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  Longest Streak
                </span>
                <p className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-1">
                  <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
                  <span>{longestStreak} Days</span>
                </p>
                <span className="text-[10px] text-muted-foreground">Personal record</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                  Best Time Window
                </span>
                <p className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight truncate">
                  {bestTime}
                </p>
                <span className="text-[10px] text-muted-foreground">Data-derived peak</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="pt-2 border-t border-border/40 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>30-Day Period Execution Progress</span>
                <span className="text-foreground">{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          </Card>

          {/* 14-Day Timeline */}
          {dailyTrend.length > 0 && (
            <Card className="bg-card border border-border rounded-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>14-Day Completion History</span>
                </h3>
                <span className="text-[10px] text-muted-foreground">Recent execution stream</span>
              </div>

              <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
                {dailyTrend.map((d) => (
                  <div
                    key={d.date}
                    className={cn(
                      'flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all',
                      !d.scheduled
                        ? 'bg-surface-sunken/40 border-border/30 opacity-40'
                        : d.completed
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold'
                        : 'bg-muted/40 border-border/60 text-muted-foreground'
                    )}
                    title={`${d.date}: ${
                      !d.scheduled ? 'Not scheduled' : d.completed ? 'Completed' : 'Missed'
                    }`}
                  >
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {d.date.slice(8)}
                    </span>
                    <span className="text-xs mt-0.5">
                      {!d.scheduled ? '—' : d.completed ? '✓' : '○'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Friction Analysis (Miss reasons breakdown) */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-warning" />
                <span>Friction Analysis</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Causes of missed or rescheduled occurrences
              </p>
            </div>

            {missReasons.length > 0 ? (
              <div className="space-y-3 pt-1">
                {missReasons.map((m) => (
                  <div key={m.reason} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">{m.reason}</span>
                      <span className="text-muted-foreground font-mono">
                        {m.count} logs ({m.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-sunken rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning rounded-full transition-all duration-300"
                        style={{ width: `${m.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground/75 italic">
                No miss reasons logged for this habit yet. Great job maintaining adherence!
              </div>
            )}
          </Card>
        </div>

        {/* Right column: Stability Risk & AI Insights */}
        <div className="lg:col-span-4 space-y-5">
          {/* Stability Risk Card */}
          <Card className="bg-card border border-border rounded-card p-5 flex flex-col justify-between h-[160px]">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                Stability Risk Level
              </span>
              <h3
                className={cn(
                  'text-2xl font-extrabold tracking-tight mt-1',
                  stabilityRisk === 'HIGH_RISK'
                    ? 'text-danger animate-pulse'
                    : stabilityRisk === 'AT_RISK'
                    ? 'text-warning'
                    : stabilityRisk === 'WATCH'
                    ? 'text-blue-400'
                    : 'text-success'
                )}
              >
                {stabilityRisk.replace('_', ' ')}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/40">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>
                14-Day Velocity: {stabilityTrend >= 0 ? `+${stabilityTrend}%` : `${stabilityTrend}%`}
              </span>
            </div>
          </Card>

          {/* AI Suggestion Card */}
          <Card className="bg-card border border-cyan-500/30 rounded-card p-5 space-y-3 shadow-ai-glow">
            <div className="flex items-center gap-1.5 border-b border-border/20 pb-2.5">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Forge AI Suggestion
              </h4>
            </div>
            <p className="text-xs text-foreground leading-relaxed font-semibold">
              {aiSuggestion}
            </p>
          </Card>

          {/* Habit Details Checklist Items if present */}
          {habit.checklistItems && habit.checklistItems.length > 0 && (
            <Card className="bg-card border border-border rounded-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Routine Steps ({habit.checklistItems.length})
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {habit.checklistItems.map((step, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-surface-elevated border border-border text-[10px] font-bold flex items-center justify-center text-foreground font-mono">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
