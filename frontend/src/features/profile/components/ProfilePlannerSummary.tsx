import React from 'react';
import { Card } from '@/components/ui/Card';
import { ProfilePlannerSummary as PlannerData } from '@/types/profile';
import { Calendar, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfilePlannerSummaryProps {
  planner?: PlannerData;
}

export const ProfilePlannerSummary: React.FC<ProfilePlannerSummaryProps> = ({ planner }) => {
  const preferredTime = planner?.preferredFocusTime || 'Morning (07:30 AM – 11:30 AM)';
  const reliability = planner?.planningReliability ?? 86;
  const plannedFocus = planner?.averagePlannedFocus || '4h 15m';
  const completedFocus = planner?.averageCompletedFocus || '3h 30m';

  return (
    <Card className="p-6 bg-surface-elevated border-border shadow-card h-full flex flex-col justify-between space-y-5">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Planning &amp; Focus Profile
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Execution cadence derived from your calendar</p>
        </div>
        <Link
          to="/dashboard?tab=planner"
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
        >
          Open Planner <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs flex-1">
        <div className="p-3.5 rounded-xl bg-surface border border-border/60 space-y-1">
          <span className="text-[10px] font-bold uppercase text-muted-foreground block">Preferred Focus Window</span>
          <span className="font-bold text-foreground block truncate">{preferredTime}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-border/60 space-y-1">
          <span className="text-[10px] font-bold uppercase text-muted-foreground block">Planning Reliability</span>
          <div className="flex items-center justify-between pt-0.5">
            <span className="font-black text-foreground text-sm">{reliability}%</span>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-border/60 space-y-1">
          <span className="text-[10px] font-bold uppercase text-muted-foreground block">Avg Planned Focus</span>
          <span className="font-bold text-foreground text-sm flex items-center gap-1.5 pt-0.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {plannedFocus} / day
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface border border-border/60 space-y-1">
          <span className="text-[10px] font-bold uppercase text-muted-foreground block">Avg Completed Focus</span>
          <span className="font-bold text-foreground text-sm flex items-center gap-1.5 pt-0.5">
            <Clock className="h-3.5 w-3.5 text-emerald-500" />
            {completedFocus} / day
          </span>
        </div>
      </div>
    </Card>
  );
};
