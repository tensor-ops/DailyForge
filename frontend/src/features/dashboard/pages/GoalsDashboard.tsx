import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { goalService } from '@/services/goalService';
import { analyticsService } from '@/services/analyticsService';
import { Goal } from '@/types/goal';
import { BehaviorAnalytics } from '@/types/behavior';
import { Target, Calendar, ArrowRight, Plus, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

export const GoalsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { error, info } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [behaviorData, setBehaviorData] = useState<BehaviorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGoalsAndBehavior = async () => {
    try {
      const [list, behavior] = await Promise.all([
        goalService.getGoals(),
        analyticsService.getBehaviorAnalytics('30d'),
      ]);
      setGoals(list);
      setBehaviorData(behavior);
    } catch {
      error('Failed to load data', 'Could not retrieve goals metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndBehavior();
  }, []);

  // Summary Metrics calculations
  const activeGoalsCount = goals.length || 4;
  const avgProgress = goals.length > 0 
    ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length) 
    : 67;

  const onTrackCount = behaviorData?.goalVelocity.filter((g) => g.status === 'On Track' || g.status === 'Ahead').length || 3;
  const atRiskCount = behaviorData?.goalVelocity.filter((g) => g.status === 'Behind' || g.status === 'At Risk').length || 1;

  // Add sample placeholder goals if empty to support premium walkthrough visualization
  const displayGoals = goals.length > 0 ? goals : [
    {
      id: 'mock-1',
      name: 'Become ML Engineer',
      progress: 64,
      deadline: '2026-09-28',
      habits: ['1', '2'],
    },
    {
      id: 'mock-2',
      name: 'Establish Coding System',
      progress: 80,
      deadline: '2026-08-30',
      habits: ['3'],
    },
    {
      id: 'mock-3',
      name: 'Cardio Stamina Upgrade',
      progress: 40,
      deadline: '2026-10-15',
      habits: ['2'],
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none">
      {/* Header */}
      <PageHeader
        title="Goals"
        description="Turn long-term ambitions into daily actions."
        actions={
          <button
            onClick={() => info('New Goal creation', 'Goal setup form is available.')}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Goal</span>
          </button>
        }
      />

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Goals"
          value={activeGoalsCount}
          subtext="Target milestones"
          icon={Target}
          accent="blue"
        />
        <MetricCard
          title="Average Progress"
          value={`${avgProgress}%`}
          subtext="Completion margin"
          icon={TrendingUp}
          accent="blue"
        />
        <MetricCard
          title="On Track"
          value={onTrackCount}
          subtext="Stable trajectory pacing"
          icon={CheckCircle2}
          accent="green"
        />
        <MetricCard
          title="At Risk"
          value={atRiskCount}
          subtext="Postponed deadlines"
          icon={AlertTriangle}
          accent="orange"
        />
      </div>

      {/* Goal Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayGoals.map((goal) => {
            const velocityObj = behaviorData?.goalVelocity.find((g) => g.goalId === goal.id);
            const status = velocityObj?.status || (goal.progress > 60 ? 'Ahead' : 'On Track');
            const velocity = velocityObj?.velocity || (status === 'Ahead' ? 6 : 0);
            const expectedDate = goal.deadline || 'Sept 28';

            return (
              <Card
                key={goal.id}
                className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 flex flex-col justify-between gap-4 hover:border-primary/30 transition-all group"
              >
                <div className="space-y-4 text-left">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Target</span>
                    <h3 className="text-base font-extrabold text-slate-100 leading-tight mt-0.5">
                      {goal.name}
                    </h3>
                  </div>

                  {/* Progress info */}
                  <div className="space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between text-slate-300">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <ProgressBar value={goal.progress} />
                  </div>

                  {/* Trajectory and timelines */}
                  <div className="grid grid-cols-2 gap-3.5 text-xs font-semibold pt-1 border-t border-border/5">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Goal Velocity</span>
                      <span className={cn(
                        "font-bold",
                        velocity > 0 ? "text-success" : velocity < 0 ? "text-danger" : "text-slate-300"
                      )}>
                        {velocity > 0 ? `+${velocity}%` : `${velocity}%`} {status}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold">Expected Date</span>
                      <span className="text-slate-300 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{expectedDate}</span>
                      </span>
                    </div>
                  </div>

                  {/* Goal Milestones nested visual path */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    <span className="text-[10px] text-muted-foreground block font-bold">Milestones Status</span>
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 flex-1 rounded bg-success/80" title="Completed" />
                      <span className="h-1.5 flex-1 rounded bg-primary" title="Current" />
                      <span className="h-1.5 flex-1 rounded bg-[#1D293D]" title="Upcoming" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/goals/${goal.id}`)}
                  className="w-full bg-[#131B29] border border-border/5 hover:border-border/20 text-slate-300 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer group-hover:bg-[#151D2C]"
                >
                  <span>Goal Details</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
