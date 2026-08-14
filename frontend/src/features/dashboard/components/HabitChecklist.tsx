import React from 'react';
import { Habit } from '@/types/habit';
import { CheckCircle2, Circle, Flame, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

const CATEGORY_COLORS: Record<string, string> = {
  Health: 'bg-emerald-500/15 text-emerald-400',
  Fitness: 'bg-blue-500/15 text-blue-400',
  Study: 'bg-indigo-500/15 text-indigo-400',
  Work: 'bg-amber-500/15 text-amber-400',
  Personal: 'bg-purple-500/15 text-purple-400',
  Finance: 'bg-green-500/15 text-green-400',
  Mindfulness: 'bg-cyan-500/15 text-cyan-400',
  Other: 'bg-muted text-muted-foreground',
};

interface HabitChecklistProps {
  habits: Habit[];
  isLoading: boolean;
  onToggle: (habit: Habit) => void;
  onCreateHabit?: () => void;
  completedCount: number;
  totalCount: number;
}

export const HabitChecklist: React.FC<HabitChecklistProps> = ({
  habits,
  isLoading,
  onToggle,
  onCreateHabit,
  completedCount,
  totalCount,
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Today's Habits
            <span className="text-xs font-normal text-muted-foreground">
              ({completedCount}/{totalCount})
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Click to toggle completion</p>
        </div>
        {onCreateHabit && (
          <button
            onClick={onCreateHabit}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        )}
      </div>

      {/* Habit Rows */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-2xl">🎯</div>
          <div>
            <p className="text-sm font-medium text-foreground">Nothing forged yet.</p>
            <p className="text-xs text-muted-foreground mt-0.5">Create your first habit to start building consistency.</p>
          </div>
          {onCreateHabit && (
            <button
              onClick={onCreateHabit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Habit
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => (
            <button
              key={habit.id}
              type="button"
              onClick={() => onToggle(habit)}
              aria-label={habit.completedToday ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
              className={cn(
                'w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 group',
                habit.completedToday
                  ? 'bg-success/5 border-success/25 hover:border-success/40'
                  : 'bg-transparent border-border hover:border-border-strong hover:bg-muted/30'
              )}
            >
              {/* Completion icon */}
              <div
                className={cn(
                  'shrink-0 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200',
                  habit.completedToday
                    ? 'bg-success text-white'
                    : 'border border-border-strong text-muted-foreground group-hover:border-primary group-hover:text-primary'
                )}
              >
                {habit.completedToday ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>

              {/* Habit icon badge */}
              <div className="shrink-0 h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-base">
                {habit.icon || '🎯'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium truncate transition-colors',
                    habit.completedToday
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground'
                  )}
                >
                  {habit.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded-md',
                      CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.Other
                    )}
                  >
                    {habit.category}
                  </span>
                  {habit.currentStreak > 0 && (
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-warning">
                      <Flame className="h-3 w-3 fill-warning" />
                      {habit.currentStreak}d
                    </span>
                  )}
                </div>
              </div>

              {/* Completion rate badge */}
              <div className="shrink-0 text-right">
                <div className="text-[11px] font-semibold text-muted-foreground">
                  {habit.completionRate}%
                </div>
                <div className="text-[10px] text-muted-foreground/60">rate</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
