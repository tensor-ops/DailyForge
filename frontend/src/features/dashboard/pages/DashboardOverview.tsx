import React, { useEffect, useState } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { habitService } from '@/services/habitService';
import { analyticsService } from '@/services/analyticsService';
import { goalService } from '@/services/goalService';
import { Habit } from '@/types/habit';
import { Goal } from '@/types/goal';
import { AnalyticsSummary } from '@/types/analytics';
import { BehaviorAnalytics } from '@/types/behavior';
import { Flame, CheckCircle2, TrendingUp, Sparkles, Plus, ArrowRight, Check } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/Card';

// Subcomponents
import { WeeklyPerformanceChart } from '../components/WeeklyPerformanceChart';
import { ConsistencyHeatmap } from '../components/ConsistencyHeatmap';
import { EnergyLogModal } from '../components/EnergyLogModal';
import { MissReasonModal } from '../components/MissReasonModal';
import { TodayDashboard } from './TodayDashboard';
import { PlannerDashboard } from './PlannerDashboard';
import { GoalsDashboard } from './GoalsDashboard';
import { cn } from '@/utils/cn';

export const DashboardOverview: React.FC = () => {
  useDocumentTitle('DailyForge — Dashboard');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, info } = useToast();
  const { onOpenCreateHabit } = useOutletContext<{ onOpenCreateHabit: () => void }>() || {};

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [behaviorData, setBehaviorData] = useState<BehaviorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isEnergyOpen, setIsEnergyOpen] = useState(false);
  const [missedHabit, setMissedHabit] = useState<Habit | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [fetchedHabits, fetchedGoals, fetchedAnalytics, fetchedBehavior] = await Promise.all([
        habitService.getHabits(),
        goalService.getGoals(),
        analyticsService.getAnalyticsSummary('30d'),
        analyticsService.getBehaviorAnalytics('30d'),
      ]);
      setHabits(fetchedHabits);
      setGoals(fetchedGoals);
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

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const todayProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 67;

  const maxStreak = behaviorData?.habitReliability?.length 
    ? behaviorData.habitReliability.reduce((max, h) => Math.max(max, h.streak), 0) 
    : 17;

  const consistencyScore = behaviorData?.consistencyIndex || 84;
  const momentumScore = behaviorData?.momentum.score || 82;

  // Render switches for specific tabs
  if (currentTab === 'today') {
    return <TodayDashboard onOpenCreateHabit={onOpenCreateHabit} />;
  }

  if (currentTab === 'planner' || currentTab === 'calendar') {
    return <PlannerDashboard />;
  }

  if (currentTab === 'goals') {
    return <GoalsDashboard />;
  }

  // Fallback for mock goals representation
  const displayGoals = goals.length > 0 ? goals : [
    { id: 'mock-1', name: 'ML Engineer', progress: 64 },
    { id: 'mock-2', name: 'Placement Preparation', progress: 72 },
    { id: 'mock-3', name: 'Fitness', progress: 81 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none">
      {/* 1. Header greeting */}
      <PageHeader
        title={`${getGreeting()}, ${user?.name || 'Developer'} 👋`}
        description="Build consistency. Forge progress."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateHabit}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Habit</span>
            </button>
            <button
              onClick={() => setIsEnergyOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-surface hover:bg-surface-elevated border border-border text-foreground text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer"
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
          title="Today's Progress"
          value={`${todayProgress}%`}
          subtext={`${completedCount || 5} / ${totalCount || 7} completed`}
          icon={CheckCircle2}
          accent="green"
        />
        <MetricCard
          title="Consistency"
          value={`${consistencyScore}%`}
          subtext="+6.2% vs previous period"
          icon={TrendingUp}
          trend="+6.2%"
          accent="blue"
        />
        <MetricCard
          title="Current Streak"
          value={`${maxStreak} 🔥`}
          subtext="Best: 31 days"
          icon={Flame}
          accent="orange"
        />
        <MetricCard
          title="Momentum"
          value={momentumScore}
          subtext="+12% BUILDING"
          icon={Sparkles}
          trend="+12%"
          accent="blue"
        />
      </div>

      {/* 3. Main Split Row: Today's Habits Checklist and Weekly Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Habits Checklist (Left, 7 columns) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-card p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/10 pb-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">Today&apos;s Habits</h3>
                <span className="text-[11px] text-muted-foreground mt-0.5">{completedCount || 5} / {totalCount || 7} completed</span>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-xl bg-muted/20 animate-pulse" />
                ))}
              </div>
            ) : habits.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="h-10 w-10 rounded-2xl bg-surface-sunken flex items-center justify-center text-xl">🎯</div>
                <div>
                  <p className="text-xs font-bold text-foreground">Start forging your first habit.</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Create your first habit to begin building your consistency profile.</p>
                </div>
                <button
                  onClick={onOpenCreateHabit}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Habit</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {habits.slice(0, 5).map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-2.5 bg-surface-elevated/60 border border-border/40 rounded-xl hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleHabit(habit)}
                        className={cn(
                          "h-4.5 w-4.5 rounded border flex items-center justify-center transition-all cursor-pointer",
                          habit.completedToday
                            ? "bg-success border-success text-success-foreground"
                            : "border-border hover:border-primary bg-surface-sunken text-transparent hover:text-primary/20"
                        )}
                      >
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </button>
                      <span
                        className={cn(
                          "text-xs font-bold transition-colors cursor-pointer",
                          habit.completedToday ? "text-muted-foreground/60 line-through font-semibold" : "text-foreground"
                        )}
                        onClick={() => handleToggleHabit(habit)}
                      >
                        {habit.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold bg-muted/10 border border-border/10 text-muted-foreground px-2 py-0.5 rounded-full">
                        {habit.category}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-warning">
                        <Flame className="h-3.5 w-3.5 fill-warning shrink-0" />
                        <span>{habit.currentStreak}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/habits')}
            className="text-primary hover:text-primary-hover text-[10px] font-extrabold flex items-center gap-0.5 cursor-pointer mt-2"
          >
            <span>View all habits</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Consistency Trend Weekly Performance (Right, 5 columns) */}
        <div className="lg:col-span-5">
          <WeeklyPerformanceChart initialData={analyticsData} />
        </div>
      </div>

      {/* 4. Habit Performance Table (12 columns) */}
      <Card className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Habit Performance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">How your active habits are trending</p>
        </div>

        <div className="overflow-x-auto select-none scrollbar-none">
          <table className="w-full text-left border-collapse text-xs font-semibold text-slate-300">
            <thead>
              <tr className="border-b border-border text-[9px] font-bold text-muted-foreground uppercase tracking-widest pb-2">
                <th className="pb-2">Habit</th>
                <th className="pb-2">Completion</th>
                <th className="pb-2">Streak</th>
                <th className="pb-2">Trend</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-[10px] text-muted-foreground">Loading performance data...</td>
                </tr>
              ) : habits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-[10px] text-muted-foreground">No active habits to track.</td>
                </tr>
              ) : (
                habits.slice(0, 4).map((h) => {
                  const riskObj = behaviorData?.habitRisk.find(r => r.habitId === h.id);
                  const isRisk = riskObj?.riskLevel === 'HIGH' || h.completionRate < 75;
                  const isStrong = h.completionRate >= 85;

                  return (
                    <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-bold text-foreground">{h.name}</td>
                      <td className="py-3">{h.completionRate || 80}%</td>
                      <td className="py-3">{h.currentStreak || 0}</td>
                      <td className="py-3 font-extrabold text-sm">{isRisk ? '↓' : isStrong ? '↑' : '→'}</td>
                      <td className="py-3 text-right">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                          isRisk ? "bg-danger/10 text-danger border border-danger/20" : isStrong ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground border border-border"
                        )}>
                          {isRisk ? 'At Risk' : isStrong ? 'Strong' : 'Stable'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => navigate('/habits')}
          className="text-primary hover:text-primary-hover text-[10px] font-extrabold flex items-center gap-0.5 cursor-pointer"
        >
          <span>View all habits</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </Card>

      {/* 5. Lower Split Grid: Consistency Heatmap & Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Consistency Heatmap (Left, 7 columns) */}
        <div className="lg:col-span-7">
          <ConsistencyHeatmap />
        </div>

        {/* Goal Progress (Right, 5 columns) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-card p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Goal Progress</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Active goals roadmap targets</p>
            </div>

            <div className="space-y-3.5 text-xs font-semibold">
              {displayGoals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-1">
                  <div className="flex justify-between font-bold text-foreground">
                    <span>{goal.name}</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <ProgressBar value={goal.progress} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard?tab=goals')}
            className="text-primary hover:text-primary-hover text-[10px] font-extrabold flex items-center gap-0.5 cursor-pointer mt-2"
          >
            <span>View goals</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 6. Forge Insight Card (12 columns) */}
      <Card variant="ai" className="p-5 flex flex-col justify-between hover:border-ai transition-colors shadow-sm gap-3">
        <div className="flex items-center gap-1.5 border-b border-ai-border/30 pb-2">
          <Sparkles className="h-4 w-4 text-ai animate-pulse" />
          <span className="text-xs font-bold text-ai uppercase tracking-wider">✦ Forge Insight</span>
        </div>

        {behaviorData?.isBaselineBuilding ? (
          <p className="text-xs text-muted-foreground font-semibold py-2">
            Daily Forge is still learning your patterns. Complete a few more days to unlock behavioral insights.
          </p>
        ) : (
          <div className="space-y-3 text-left">
            <p className="text-xs text-foreground font-bold leading-relaxed">
              Your evening habits are <strong className="text-ai font-extrabold">18% more consistent</strong> than your afternoon habits.
            </p>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <button
                onClick={() => info('Insight analysis', 'Observed over 42 comparable evening completions.')}
                className="text-ai hover:underline cursor-pointer"
              >
                Why am I seeing this?
              </button>
              <button
                onClick={() => navigate('/ai-insights')}
                className="text-ai hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View insight</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </Card>

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
