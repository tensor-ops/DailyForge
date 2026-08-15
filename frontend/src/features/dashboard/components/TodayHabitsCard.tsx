import React from 'react';
import { Habit } from '@/types/habit';
import { cn } from '@/utils/cn';
import { Flame, Plus, Check } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Health: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Fitness: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Study: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  Work: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Personal: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  Finance: 'bg-green-500/10 text-green-400 border border-green-500/20',
  Mindfulness: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  Other: 'bg-muted/10 text-muted-foreground border border-border/10',
};

interface TodayHabitsCardProps {
  habits: Habit[];
  isLoading: boolean;
  onToggle: (habit: Habit) => void;
  onCreateHabit?: () => void;
}

export const TodayHabitsCard: React.FC<TodayHabitsCardProps> = ({
  habits,
  isLoading,
  onToggle,
  onCreateHabit,
}) => {
  return (
    <div className="bg-card border border-border rounded-card p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Today&apos;s Habits</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Click to toggle completion</p>
        </div>
        {onCreateHabit && (
          <button
            onClick={onCreateHabit}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Habit</span>
          </button>
        )}
      </div>

      {/* Habits Checklist List */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="h-12 w-12 rounded-2xl bg-surface-sunken flex items-center justify-center text-xl">🎯</div>
          <div>
            <p className="text-xs font-bold text-foreground">No habits today.</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Create one to start consistent habits.</p>
          </div>
          {onCreateHabit && (
            <button
              onClick={onCreateHabit}
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-primary text-foreground rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Habit</span>
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto select-none scrollbar-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/10 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                <th className="pb-2 w-10">Status</th>
                <th className="pb-2">Habit</th>
                <th className="pb-2">Category</th>
                <th className="pb-2 text-right">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/5">
              {habits.map((habit) => (
                <tr 
                  key={habit.id}
                  className="group hover:bg-muted/40 transition-colors"
                >
                  {/* Status Checkbox Column */}
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => onToggle(habit)}
                      className={cn(
                        "h-5 w-5 rounded border flex items-center justify-center transition-all cursor-pointer",
                        habit.completedToday
                          ? "bg-success border-success text-foreground"
                          : "border-border hover:border-primary bg-surface-sunken text-transparent hover:text-primary/20"
                      )}
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                    </button>
                  </td>

                  {/* Habit Name Column */}
                  <td className="py-3 pr-2">
                    <span 
                      onClick={() => onToggle(habit)}
                      className={cn(
                        "text-xs font-semibold cursor-pointer transition-colors block truncate max-w-[120px] sm:max-w-[180px]",
                        habit.completedToday ? "text-muted-foreground/60 line-through" : "text-foreground"
                      )}
                    >
                      {habit.name}
                    </span>
                  </td>

                  {/* Category badge */}
                  <td className="py-3">
                    <span 
                      className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full inline-block",
                        CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.Other
                      )}
                    >
                      {habit.category}
                    </span>
                  </td>

                  {/* Streak details */}
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-warning">
                      <Flame className="h-3.5 w-3.5 fill-warning shrink-0" />
                      <span>{habit.currentStreak}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
