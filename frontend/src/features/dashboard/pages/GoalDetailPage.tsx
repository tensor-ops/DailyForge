import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { goalService } from '@/services/goalService';
import { analyticsService } from '@/services/analyticsService';
import { Goal } from '@/types/goal';
import { BehaviorAnalytics } from '@/types/behavior';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';

export const GoalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error } = useToast();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [behaviorData, setBehaviorData] = useState<BehaviorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useDocumentTitle(goal ? `DailyForge — ${goal.name}` : 'Goal Detail');

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      try {
        const [fetchedGoal, fetchedBehavior] = await Promise.all([
          goalService.getGoal(id),
          analyticsService.getBehaviorAnalytics('30d'),
        ]);
        setGoal(fetchedGoal);
        setBehaviorData(fetchedBehavior);
      } catch (err) {
        error('Load failed', 'Unable to fetch goal details.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id, navigate, error]);

  if (loading) {
    return <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">Loading goal...</div>;
  }

  if (!goal) return null;

  const velocityObj = behaviorData?.goalVelocity.find((g) => g.goalId === goal.id);
  const velocityStatus = velocityObj?.status || 'On Track';
  const velocity = velocityObj?.velocity || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left select-none">
      {/* Back navigation & header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-[#101622] hover:bg-[#131B29] border border-[#1D293D] text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Goal</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-0.5">{goal.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main statistics cards */}
        <div className="md:col-span-2 space-y-5">
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Goal Status Snapshot</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Overall Progress</span>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">{goal.progress || 0}%</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Target Velocity</span>
                <p className={`text-2xl font-extrabold tracking-tight ${
                  velocityStatus === 'Ahead' ? 'text-success font-bold' : velocityStatus === 'Behind' ? 'text-danger font-bold' : 'text-primary font-bold'
                }`}>{velocityStatus}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Expected Pace</span>
                <p className="text-lg font-bold text-slate-300 tracking-tight">{velocityObj?.expectedProgress || 0}%</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground">Goal Deadline</span>
                <p className="text-sm font-bold text-slate-300 tracking-tight flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>{goal.deadline || 'No target date'}</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Supporting habits list */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Supporting Habits</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Linked habits feeding consistency to this target</p>
            </div>
            {goal.habits && goal.habits.length > 0 ? (
              <div className="space-y-3">
                {goal.habits.map((habitId: any) => {
                  const matchingHabit = behaviorData?.habitReliability.find((h) => h.habitId === habitId.toString());
                  return (
                    <div 
                      key={habitId.toString()}
                      className="p-3 bg-[#131B29] border border-border/5 rounded-xl text-xs font-semibold flex items-center justify-between gap-4"
                    >
                      <span className="text-slate-300 truncate font-extrabold">
                        {matchingHabit?.name || 'Linked Habit node'}
                      </span>
                      <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full shrink-0 border border-success/5">
                        {matchingHabit?.reliability || 80}% Reliability
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 py-4 text-center italic">
                No active habits mapped to this goal yet.
              </p>
            )}
          </Card>
        </div>

        {/* Sidebar suggestions */}
        <div className="space-y-5">
          {/* Velocity Progress Card */}
          <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 flex flex-col justify-between h-[150px]">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Velocity Margin</span>
              <h3 className="text-xl font-extrabold tracking-tight mt-1 text-slate-200">
                {velocity > 0 ? `+${velocity}%` : `${velocity}%`}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Pacing is {velocityStatus.toLowerCase()} target</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
