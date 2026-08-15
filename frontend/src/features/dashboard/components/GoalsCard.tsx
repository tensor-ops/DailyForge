import React from 'react';
import { mockGoals, MockGoal } from '../data/mockDashboardData';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';

interface GoalsCardProps {
  goals?: MockGoal[];
}

export const GoalsCard: React.FC<GoalsCardProps> = ({ goals = mockGoals }) => {
  const { user } = useAuth();
  
  const userGoals = user?.preferences?.goals;
  
  // Construct dynamic goals if user configured them during onboarding
  const displayedGoals: MockGoal[] = (userGoals && userGoals.length > 0)
    ? userGoals.slice(0, 3).map((gName, index) => {
        const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
        const progressValues = [25, 10, 0];
        return {
          id: `onb-${index}`,
          title: `Build Consistency: ${gName}`,
          progress: progressValues[index] || 0,
          target: '30 days',
          current: index === 0 ? '7' : index === 1 ? '3' : '0',
          deadline: 'Sep 15',
          priority: priorities[index] || 'low',
        };
      })
    : goals;
  const getPriorityBadgeClass = (priority: MockGoal['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-danger/10 text-danger border border-danger/20';
      case 'medium':
        return 'bg-warning/10 text-warning border border-warning/20';
      case 'low':
        return 'bg-primary/10 text-primary border border-primary/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Current Goals</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Focus areas and target achievements</p>
      </div>

      <div className="space-y-4">
        {displayedGoals.map((goal) => (
          <div key={goal.id} className="space-y-2 border-b border-border/40 last:border-0 pb-3 last:pb-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground truncate">{goal.title}</span>
              <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded', getPriorityBadgeClass(goal.priority))}>
                {goal.priority}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                <span>{goal.progress}% completed</span>
                <span>{goal.current} / {goal.target}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
              <span>Deadline: <strong className="text-foreground">{goal.deadline}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
