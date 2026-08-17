import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProfileGoalItem } from '@/types/profile';
import { Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileGoalsSummaryProps {
  goals?: {
    active?: ProfileGoalItem[];
    totalCompleted?: number;
    totalActive?: number;
    averageProgress?: number;
  };
}

export const ProfileGoalsSummary: React.FC<ProfileGoalsSummaryProps> = ({ goals }) => {
  const activeGoals = goals?.active || [];
  const completed = goals?.totalCompleted ?? 0;
  const activeCount = goals?.totalActive ?? activeGoals.length;
  const avgProgress = goals?.averageProgress ?? 0;

  return (
    <Card className="p-6 bg-surface-elevated border-border shadow-card h-full flex flex-col justify-between space-y-5">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Active Growth Goals
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completed} completed • {activeCount} active • {avgProgress}% avg progress
          </p>
        </div>
        <Link
          to="/dashboard?tab=goals"
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
        >
          All Goals <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-3 flex-1">
        {activeGoals.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-bold text-foreground">No active goals linked yet.</p>
            <Link to="/dashboard?tab=goals" className="text-primary font-bold hover:underline">
              Create your first goal →
            </Link>
          </div>
        ) : (
          activeGoals.slice(0, 3).map((goal) => (
            <div key={goal.id} className="p-3.5 rounded-xl bg-surface border border-border/70 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground truncate">{goal.title}</span>
                <Badge variant="outline" size="sm" className="text-[10px] shrink-0 font-bold">
                  {goal.category || 'Growth'}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Target: {goal.targetDate || 'Upcoming'}</span>
                  <span className="font-extrabold text-foreground">{goal.progress ?? 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, goal.progress ?? 0)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
