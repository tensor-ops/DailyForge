import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { habitService } from '@/services/habitService';
import { aiService } from '@/services/aiService';
import { analyticsService } from '@/services/analyticsService';
import { Habit } from '@/types/habit';
import { AIInsight } from '@/types/ai';
import { AnalyticsSummary } from '@/types/analytics';
import { Flame, CheckCircle2, TrendingUp, Sparkles, Plus } from 'lucide-react';

// Subcomponents
import { KpiCard } from '../components/KpiCard';
import { WeeklyPerformanceChart } from '../components/WeeklyPerformanceChart';
import { ProgressRingCard } from '../components/ProgressRingCard';
import { HabitChecklist } from '../components/HabitChecklist';
import { TodaySchedule } from '../components/TodaySchedule';
import { HabitHeatmap } from '../components/HabitHeatmap';
import { ForgeScoreCard } from '../components/ForgeScoreCard';
import { ForgeInsightCard } from '../components/ForgeInsightCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { GoalsCard } from '../components/GoalsCard';
import { Achievements } from '../components/Achievements';
import { MiniAnalytics } from '../components/MiniAnalytics';

export const DashboardOverview: React.FC = () => {
  useDocumentTitle('DailyForge — Dashboard');
  
  const { user } = useAuth();
  const { success } = useToast();
  const { onOpenCreateHabit } = useOutletContext<{ onOpenCreateHabit: () => void }>() || {};

  const [habits, setHabits] = useState<Habit[]>([]);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [fetchedHabits, fetchedInsights, fetchedAnalytics] = await Promise.all([
        habitService.getHabits(),
        aiService.getInsights(),
        analyticsService.getAnalyticsSummary('30d'),
      ]);
      setHabits(fetchedHabits);
      if (fetchedInsights.length > 0) {
        setInsight(fetchedInsights[0]);
      }
      setAnalyticsData(fetchedAnalytics);
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
      
      // Refresh analytics summary to update progress metrics & chart
      const updatedAnalytics = await analyticsService.getAnalyticsSummary('30d');
      setAnalyticsData(updatedAnalytics);
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

  // Computations
  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  // Compute Forge Score dynamically based on: Streak (30%), Completion Rate (40%), Consistency (30%)
  const consistencyScore = analyticsData?.consistencyScore || 80;
  const avgCompletionRate = analyticsData?.avgDailyRate || 75;
  const streakFactor = Math.min(100, maxStreak * 5); // caps at 20 days for 100% streak score weight
  const forgeScore = Math.min(
    1000,
    Math.round(
      (streakFactor * 0.3 + avgCompletionRate * 0.4 + consistencyScore * 0.3) * 10
    ) || 450
  );

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. GREETING & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {getGreeting()}, {user?.name || 'Developer'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
            Today is <span className="text-foreground font-semibold">{formattedDate}</span>
            <span className="text-border-strong">·</span>
            <span>Build consistency. One day at a time.</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateHabit}
            leftIcon={<Plus className="h-4 w-4 text-muted-foreground" />}
          >
            Add Task
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateHabit}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Habit
          </Button>
        </div>
      </div>

      {/* 2. TOP KPI SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Flame}
          iconBgClass="bg-warning/10"
          iconColorClass="text-warning fill-warning"
          value={`${maxStreak} Days`}
          label="Current Streak"
          delta="+3 days"
          deltaPositive={true}
          subtext="Keep the streak alive"
          accent="orange"
          className="border-warning/20 shadow-warning-glow"
        />

        <KpiCard
          icon={TrendingUp}
          iconBgClass="bg-primary/10"
          iconColorClass="text-primary"
          value={`${consistencyScore}%`}
          label="Consistency"
          delta="+8.4%"
          deltaPositive={true}
          subtext="Vs last week"
          accent="blue"
        />

        <KpiCard
          icon={Sparkles}
          iconBgClass="bg-ai/10"
          iconColorClass="text-ai"
          value={forgeScore}
          label="Forge Score"
          delta="+42"
          deltaPositive={true}
          subtext="Composite rating"
          accent="purple"
        />

        <KpiCard
          icon={CheckCircle2}
          iconBgClass="bg-success/10"
          iconColorClass="text-success"
          value={`${completionPercentage}%`}
          label="Today's Progress"
          subtext={`${completedCount} of ${totalCount} habits done`}
          accent="emerald"
        />
      </div>

      {/* 3. MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly performance (Large/Left) */}
        <div className="lg:col-span-2">
          <WeeklyPerformanceChart initialData={analyticsData} />
        </div>

        {/* Today's Progress circle (Right) */}
        <div>
          <ProgressRingCard
            percentage={completionPercentage}
            completed={completedCount}
            total={totalCount}
            isLoading={isLoading}
          />
        </div>

        {/* Row 2: Today's Habits Checklist */}
        <div className="lg:col-span-2">
          <HabitChecklist
            habits={habits}
            isLoading={isLoading}
            onToggle={handleToggleHabit}
            onCreateHabit={onOpenCreateHabit}
            completedCount={completedCount}
            totalCount={totalCount}
          />
        </div>

        {/* Today's Schedule */}
        <div>
          <TodaySchedule />
        </div>

        {/* Row 3: Heatmap (2 cols) & Forge Score segmented dial (1 col) */}
        <div className="lg:col-span-2">
          <HabitHeatmap habits={habits} isLoading={isLoading} />
        </div>

        <div>
          <ForgeScoreCard
            score={forgeScore}
            consistency={consistencyScore}
            completion={avgCompletionRate}
            streak={Math.round((maxStreak / 30) * 100)} // Streak ratio relative to monthly milestone
            streakDays={maxStreak}
            weekDelta={42}
            isLoading={isLoading}
          />
        </div>

        {/* Row 4: AI Insights, Activity Feed, Goals & Achievements */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-4">
            <ForgeInsightCard insight={insight} isLoading={isLoading} />
            <GoalsCard />
          </div>

          <div>
            <ActivityFeed habits={habits} isLoading={isLoading} />
          </div>

          <div className="space-y-4">
            <MiniAnalytics analyticsData={analyticsData} isLoading={isLoading} />
            <Achievements />
          </div>
        </div>
      </div>
    </div>
  );
};
