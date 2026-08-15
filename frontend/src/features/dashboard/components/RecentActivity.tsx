import React from 'react';
import { Card } from '@/components/ui/Card';
import { Check, Flame, Trophy } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'habit' | 'streak' | 'achievement';
  title: string;
  time: string;
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  completedCount?: number;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, completedCount = 0 }) => {
  const defaultActivities: ActivityItem[] = [
    { id: '1', type: 'habit', title: 'Completed DSA Practice', time: '10 minutes ago' },
    { id: '2', type: 'habit', title: 'Completed Exercise', time: '2 hours ago' },
    { id: '3', type: 'streak', title: 'Streak increased to 17 days', time: '4 hours ago' },
    { id: '4', type: 'achievement', title: 'Achievement unlocked: 7 Day Streak', time: 'Yesterday' }
  ];

  // If habits were completed, we can dynamically prefix a log for feedback!
  const listToRender = [...defaultActivities];
  if (completedCount > 0) {
    listToRender.unshift({
      id: 'dynamic-log',
      type: 'habit',
      title: 'Completed Daily Habit node',
      time: 'Just now'
    });
  }

  const displayedList = activities || listToRender.slice(0, 4);

  return (
    <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Live logs from your productivity nodes</p>
      </div>

      <div className="space-y-4 my-auto relative pl-4 border-l border-border/10 ml-2">
        {displayedList.map((act) => (
          <div key={act.id} className="relative space-y-0.5">
            <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border border-[#1D293D] bg-[#0B0F1A] flex items-center justify-center text-[8px] font-bold">
              {act.type === 'habit' && <Check className="h-2 w-2 text-[#10B981]" />}
              {act.type === 'streak' && <Flame className="h-2.5 w-2.5 text-[#F59E0B] fill-[#F59E0B]" />}
              {act.type === 'achievement' && <Trophy className="h-2 w-2 text-[#2563EB]" />}
            </span>
            <h4 className="text-xs font-bold text-slate-200 leading-none">{act.title}</h4>
            <p className="text-[10px] text-muted-foreground">{act.time}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
