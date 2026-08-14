import React from 'react';
import { mockSchedule, MockScheduleItem } from '../data/mockDashboardData';
import { cn } from '@/utils/cn';
import { CheckCircle2, Clock } from 'lucide-react';

interface TodayScheduleProps {
  schedule?: MockScheduleItem[];
}

const CATEGORY_BORDER_COLORS: Record<string, string> = {
  Health: 'border-emerald-500',
  Fitness: 'border-blue-500',
  Study: 'border-indigo-500',
  Work: 'border-amber-500',
  Personal: 'border-purple-500',
  Finance: 'border-green-500',
  Mindfulness: 'border-cyan-500',
  Other: 'border-muted-foreground',
};

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ schedule = mockSchedule }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Today's Schedule</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Time-blocked consistency routine</p>
      </div>

      <div className="relative border-l border-border/80 ml-3 pl-5 space-y-4 py-1">
        {schedule.map((item) => (
          <div key={item.id} className="relative space-y-1">
            {/* Timeline node icon */}
            <span
              className={cn(
                'absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-background flex items-center justify-center transition-colors',
                item.status === 'completed'
                  ? 'border-success bg-success text-white'
                  : item.status === 'missed'
                  ? 'border-danger bg-danger text-white'
                  : 'border-border-strong'
              )}
            >
              {item.status === 'completed' && <CheckCircle2 className="h-2 w-2" />}
            </span>

            {/* Time label */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <Clock className="h-3 w-3" />
              {item.time}
            </div>

            {/* Activity details card */}
            <div
              className={cn(
                'p-3 rounded-xl border bg-muted/20 text-left transition-colors duration-150',
                CATEGORY_BORDER_COLORS[item.category]
                  ? `border-l-[3px] ${CATEGORY_BORDER_COLORS[item.category]}`
                  : 'border-l-[3px] border-l-border-strong',
                item.status === 'completed' ? 'opacity-70' : ''
              )}
            >
              <h4 className="text-xs font-semibold text-foreground">{item.title}</h4>
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block mt-1">
                {item.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
