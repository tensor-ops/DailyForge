import React from 'react';
import { Habit } from '@/types/habit';
import { CheckCircle2, Flame, Trophy } from 'lucide-react';

interface ActivityFeedProps {
  habits: Habit[];
  isLoading?: boolean;
}

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  text: string;
  time: string;
  type: 'completion' | 'streak' | 'achievement';
}

function buildActivityFeed(habits: Habit[]): ActivityItem[] {
  const items: ActivityItem[] = [];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  habits.forEach((habit) => {
    if (habit.completedToday) {
      items.push({
        id: `${habit.id}-today`,
        icon: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
        text: `Completed "${habit.name}"`,
        time: 'Today',
        type: 'completion',
      });
    }
    if (habit.history?.[yesterday]) {
      items.push({
        id: `${habit.id}-yesterday`,
        icon: <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />,
        text: `Completed "${habit.name}"`,
        time: 'Yesterday',
        type: 'completion',
      });
    }
    if (habit.currentStreak >= 7 && habit.currentStreak % 7 === 0) {
      items.push({
        id: `${habit.id}-streak`,
        icon: <Flame className="h-3.5 w-3.5 text-warning fill-warning" />,
        text: `${habit.currentStreak}-day streak on "${habit.name}"`,
        time: 'Today',
        type: 'streak',
      });
    }
    if (habit.longestStreak >= 30) {
      items.push({
        id: `${habit.id}-achievement`,
        icon: <Trophy className="h-3.5 w-3.5 text-warning" />,
        text: `30-day milestone on "${habit.name}"`,
        time: 'Recently',
        type: 'achievement',
      });
    }
  });

  // Sort: completions today first, then yesterday, then achievements
  return items
    .sort((a, b) => {
      const order = { completion: 0, streak: 1, achievement: 2 };
      return order[a.type] - order[b.type];
    })
    .slice(0, 8);
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ habits, isLoading = false }) => {
  const feed = buildActivityFeed(habits);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Activity</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Recent completions and milestones</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-muted-foreground">No activity yet. Complete a habit to get started.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {feed.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="shrink-0 h-6 w-6 rounded-lg bg-muted/40 flex items-center justify-center mt-0.5">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground font-medium leading-snug truncate">{item.text}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
