import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { habitService } from '@/services/habitService';
import { aiService } from '@/services/aiService';
import { Habit } from '@/types/habit';
import { AIInsight } from '@/types/ai';
import {
  Flame,
  CheckCircle2,
  Circle,
  Sparkles,
  TrendingUp,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const { onOpenCreateHabit } = useOutletContext<{ onOpenCreateHabit: () => void }>() || {};

  const [habits, setHabits] = useState<Habit[]>([]);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [fetchedHabits, fetchedInsights] = await Promise.all([
        habitService.getHabits(),
        aiService.getInsights(),
      ]);
      setHabits(fetchedHabits);
      if (fetchedInsights.length > 0) {
        setInsight(fetchedInsights[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleHabitsUpdated = () => {
      fetchDashboardData();
    };

    window.addEventListener('habits-updated', handleHabitsUpdated);
    return () => window.removeEventListener('habits-updated', handleHabitsUpdated);
  }, []);

  const handleToggleHabit = async (habit: Habit) => {
    const nextCompleted = !habit.completedToday;
    
    // Optimistic UI update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? {
              ...h,
              completedToday: nextCompleted,
              currentStreak: nextCompleted ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
            }
          : h
      )
    );

    try {
      const updated = await habitService.toggleComplete(habit);
      if (nextCompleted) {
        success('Habit completed! ✓', `"${habit.name}" marked done for today.`);
      }
      setHabits((prev) => prev.map((h) => (h.id === habit.id ? updated : h)));
    } catch (err) {
      console.error(err);
      fetchDashboardData();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  return (
    <div className="space-y-6">
      {/* 1. GREETING & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {user?.name || 'Friend'} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Let&apos;s make today count. You have {totalCount - completedCount} habits remaining today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateHabit}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Habit
          </Button>
        </div>
      </div>

      {/* 2. DASHBOARD HERO PROGRESS & KPI ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hero Progress Card */}
        <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-card via-card to-primary/5 border-border/80 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Today&apos;s Momentum
                </span>
                <Badge variant={completionPercentage >= 75 ? 'success' : 'default'} size="sm">
                  {completedCount}/{totalCount} Completed
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  {completionPercentage}%
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {completionPercentage === 100
                    ? 'Incredible! You completed all scheduled habits today 🎉'
                    : completionPercentage >= 50
                    ? "Great job — you're building strong daily consistency."
                    : 'Get started on your first habit to ignite your streak.'}
                </p>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-ai rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative h-28 w-28 shrink-0 flex items-center justify-center self-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-muted stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-primary stroke-current transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - completionPercentage / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-extrabold text-foreground">{completionPercentage}%</span>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Done</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Consistency / Streak Stat Card */}
        <Card className="p-6 bg-card border-border/80 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-warning/15 text-warning flex items-center justify-center">
                <Flame className="h-5 w-5 fill-warning" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Top Active Streak
              </span>
            </div>
            <Badge variant="warning" size="sm">🔥 Active</Badge>
          </div>

          <div>
            <div className="text-3xl font-bold text-foreground">{maxStreak} Days</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              <span className="text-success font-medium">+3 days</span> vs previous week
            </p>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall Consistency</span>
            <span className="font-semibold text-foreground">87% (Grade A)</span>
          </div>
        </Card>
      </div>

      {/* 3. AI INSIGHT BANNER */}
      {insight && (
        <Card variant="ai" className="p-4 sm:p-5 bg-card/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-ai/15 text-ai flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ai">
                    AI Pattern Detected
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ({Math.round(insight.confidence * 100)}% confidence)
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {insight.headline}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {insight.explanation}
                </p>
              </div>
            </div>

            {insight.actionLabel && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 self-start sm:self-center border-ai/30 text-ai hover:bg-ai/10"
                rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
              >
                {insight.actionLabel}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* 4. TODAY'S HABITS CHECKLIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Today&apos;s Habits
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              ({completedCount}/{totalCount})
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Click card to complete</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-card bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {habits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => handleToggleHabit(habit)}
                className={`p-4 rounded-card border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 select-none ${
                  habit.completedToday
                    ? 'bg-success/5 border-success/30 hover:border-success/50'
                    : 'bg-card border-border hover:border-border-strong hover:bg-card-hover'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Icon badge */}
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      habit.completedToday ? 'bg-success/15' : 'bg-muted'
                    }`}
                  >
                    {habit.icon || '🎯'}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <h3
                      className={`text-sm font-semibold truncate transition-colors ${
                        habit.completedToday
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      }`}
                    >
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{habit.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-medium text-warning">
                        <Flame className="h-3 w-3 fill-warning" />
                        {habit.currentStreak}d streak
                      </span>
                    </div>
                  </div>
                </div>

                {/* Completion Checkmark */}
                <button
                  type="button"
                  aria-label={habit.completedToday ? 'Mark incomplete' : 'Mark complete'}
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    habit.completedToday
                      ? 'bg-success text-success-foreground shadow-sm'
                      : 'border border-border text-muted-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  {habit.completedToday ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
