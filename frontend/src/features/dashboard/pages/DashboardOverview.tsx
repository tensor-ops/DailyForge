import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { habitService } from '@/services/habitService';
import { analyticsService } from '@/services/analyticsService';
import { Habit } from '@/types/habit';
import { AnalyticsSummary } from '@/types/analytics';
import { BehaviorAnalytics } from '@/types/behavior';
import { Flame, CheckCircle2, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

// Subcomponents
import { MetricCard } from '../components/MetricCard';
import { WeeklyPerformanceChart } from '../components/WeeklyPerformanceChart';
import { TodayProgressCard } from '../components/TodayProgressCard';
import { TodayHabitsCard } from '../components/TodayHabitsCard';
import { WeeklyActivityChart } from '../components/WeeklyActivityChart';
import { CategoryPerformance } from '../components/CategoryPerformance';
import { ForgeScoreCard } from '../components/ForgeScoreCard';
import { ConsistencyHeatmap } from '../components/ConsistencyHeatmap';
import { GoalsCard } from '../components/GoalsCard';
import { RecentActivity } from '../components/RecentActivity';
import { ForgeInsight } from '../components/ForgeInsight';
import { Achievements } from '../components/Achievements';
import { NextBestAction } from '../components/NextBestAction';
import { EnergyLogModal } from '../components/EnergyLogModal';
import { MissReasonModal } from '../components/MissReasonModal';

export const DashboardOverview: React.FC = () => {
  useDocumentTitle('DailyForge — Dashboard');

  const { user } = useAuth();
  const { success } = useToast();
  const { onOpenCreateHabit } = useOutletContext<{ onOpenCreateHabit: () => void }>() || {};

  const [habits, setHabits] = useState<Habit[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [behaviorData, setBehaviorData] = useState<BehaviorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isEnergyOpen, setIsEnergyOpen] = useState(false);
  const [missedHabit, setMissedHabit] = useState<Habit | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [fetchedHabits, fetchedAnalytics, fetchedBehavior] = await Promise.all([
        habitService.getHabits(),
        analyticsService.getAnalyticsSummary('30d'),
        analyticsService.getBehaviorAnalytics('30d'),
      ]);
      setHabits(fetchedHabits);
      setAnalyticsData(fetchedAnalytics);
      setBehaviorData(fetchedBehavior);
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

    // Trigger miss reason popup if uncompleting a habit
    if (!nextCompleted) {
      setMissedHabit(habit);
    }

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
      const [updatedAnalytics, updatedBehavior] = await Promise.all([
        analyticsService.getAnalyticsSummary('30d'),
        analyticsService.getBehaviorAnalytics('30d'),
      ]);
      setAnalyticsData(updatedAnalytics);
      setBehaviorData(updatedBehavior);
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

  // Dynamically calculate metrics with stable specs as defaults if list is empty
  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;


  const maxStreak = behaviorData?.habitReliability?.length 
    ? behaviorData.habitReliability.reduce((max, h) => Math.max(max, h.streak), 0) 
    : 17;

  const consistencyScore = behaviorData?.consistencyIndex || 84;
  const avgCompletionRate = behaviorData?.executionRate.rate || 91;
  const forgeScore = behaviorData?.forgeScore || 742;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20">
      {/* 1. Header greeting */}
      <PageHeader
        title={`${getGreeting()}, ${user?.name || 'Developer'} 👋`}
        description="Build consistency. Forge progress."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateHabit}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Habit</span>
            </button>
            <button
              onClick={() => setIsEnergyOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#101622] hover:bg-[#131B29] border border-[#1D293D] text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-4 w-4 text-primary" />
              <span>Add Task</span>
            </button>
          </div>
        }
      />

      {/* 2. Top KPI Metrics grid */}
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
          title="Consistency Index"
          value={`${consistencyScore}%`}
          subtext="+8.4% vs last week"
          icon={TrendingUp}
          trend="+8.4%"
          accent="blue"
        />
        <MetricCard
          title="Momentum"
          value={behaviorData?.momentum.score || 84}
          subtext="+12% vs last week"
          icon={Flame}
          trend="+12%"
          accent="orange"
        />
        <MetricCard
          title="Execution Rate"
          value={`${behaviorData?.executionRate.rate || 88}%`}
          subtext="+4.2% vs last week"
          icon={CheckCircle2}
          trend="+4.2%"
          accent="green"
        />
      </div>

      {/* 3. Main Split Row: Line Chart and Circular Ring Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <WeeklyPerformanceChart initialData={analyticsData} />
        </div>
        <div>
          <TodayProgressCard 
            completed={completedCount} 
            total={totalCount} 
            isLoading={isLoading} 
          />
        </div>
      </div>

      {/* 4. Second Row: Habits Table Checklist and Weekly Activity Column Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <TodayHabitsCard
            habits={habits}
            isLoading={isLoading}
            onToggle={handleToggleHabit}
            onCreateHabit={onOpenCreateHabit}
          />
        </div>
        <div>
          <WeeklyActivityChart completedHabitsCount={completedCount} />
        </div>
      </div>

      {/* 5. Third Row: Horizontal Category Bars and Radial Forge Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <CategoryPerformance />
        </div>
        <div>
          <ForgeScoreCard
            score={forgeScore}
            consistency={consistencyScore}
            completion={avgCompletionRate}
            streak={Math.round((maxStreak / 30) * 100)}
          />
        </div>
      </div>

      {/* 6. Fourth Row: Contribution Grid Heatmap and Current Goals Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ConsistencyHeatmap />
        </div>
        <div>
          <GoalsCard />
        </div>
      </div>

      {/* 7. Fifth Row: Live Activity logs stream and Next Best Action / Forge Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentActivity completedCount={completedCount} />
        </div>
        <div className="flex flex-col gap-4">
          <NextBestAction
            capacityScore={behaviorData?.focusCapacity.score}
            capacityHours={behaviorData?.focusCapacity.capacityHours}
            incompleteHabits={habits.filter((h) => !h.completedToday)}
          />
          <ForgeInsight />
          <Achievements />
        </div>
      </div>

      {/* Energy Ratings Modal */}
      <EnergyLogModal
        isOpen={isEnergyOpen}
        onClose={() => setIsEnergyOpen(false)}
        onSave={fetchDashboardData}
      />

      {/* Miss skip reason modal */}
      <MissReasonModal
        isOpen={!!missedHabit}
        habit={missedHabit}
        onClose={() => setMissedHabit(null)}
        onLogged={fetchDashboardData}
      />
    </div>
  );
};
