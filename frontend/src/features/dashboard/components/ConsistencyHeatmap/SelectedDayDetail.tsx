import React from 'react';
import { ConsistencyDay } from './heatmap.types';
import { Check, X, Circle, CheckCircle2 } from 'lucide-react';

interface SelectedDayDetailProps {
  day: ConsistencyDay;
  onClose: () => void;
}

export const SelectedDayDetail: React.FC<SelectedDayDetailProps> = ({ day, onClose }) => {
  const formattedDate = day.dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const completedHabits = day.habits.filter((h) => h.completed);
  const pendingHabits = day.habits.filter((h) => !h.completed);

  return (
    <div className="bg-surface/90 border border-border/70 rounded-xl p-3.5 mt-3 text-left space-y-3 motion-safe:animate-fade-in transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-foreground">{formattedDate}</h4>
            {day.isToday && (
              <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-extrabold uppercase tracking-wider">
                Today
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            {day.scheduled === 0
              ? 'No habits were scheduled for this date'
              : `${day.completed} / ${day.scheduled} habits completed (${day.percentage}% consistency)`}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors cursor-pointer"
          aria-label="Close detail view"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Habits List */}
      {day.habits.length > 0 ? (
        <div className="space-y-2 pt-1 border-t border-border/40">
          {completedHabits.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1 mb-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Completed ({completedHabits.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {completedHabits.map((habit) => (
                  <span
                    key={habit.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-foreground text-xs font-semibold"
                  >
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>{habit.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {pendingHabits.length > 0 && (
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1 mb-1">
                <Circle className="h-3 w-3 text-muted-foreground/60" />
                {day.isToday ? `Remaining (${pendingHabits.length})` : `Missed (${pendingHabits.length})`}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pendingHabits.map((habit) => (
                  <span
                    key={habit.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/40 border border-border/30 text-muted-foreground text-xs font-medium"
                  >
                    <Circle className="h-2.5 w-2.5 text-muted-foreground/60" />
                    <span>{habit.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/75 italic">
          No habits recorded for this day.
        </p>
      )}
    </div>
  );
};
