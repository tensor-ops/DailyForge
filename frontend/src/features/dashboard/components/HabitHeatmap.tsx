import React, { useMemo, useState } from 'react';
import { Habit } from '@/types/habit';
import { cn } from '@/utils/cn';

interface HabitHeatmapProps {
  habits: Habit[];
  isLoading?: boolean;
}

const WEEKS = 15; // 15 weeks back
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getIntensityClass(rate: number): string {
  if (rate === 0) return 'bg-muted/40';
  if (rate < 30) return 'bg-primary/15';
  if (rate < 60) return 'bg-primary/35';
  if (rate < 85) return 'bg-primary/65';
  return 'bg-primary';
}

function buildGrid(habits: Habit[]): {
  date: string;
  completed: number;
  total: number;
  rate: number;
}[][] {
  const today = new Date();
  // Go back WEEKS * 7 days from today
  const totalDays = WEEKS * 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - totalDays + 1);

  // Build a date→completionRate map from all habits history
  const dateMap: Record<string, { completed: number; total: number }> = {};
  habits.forEach((habit) => {
    if (!habit.history) return;
    Object.entries(habit.history).forEach(([dateStr, done]) => {
      if (!dateMap[dateStr]) dateMap[dateStr] = { completed: 0, total: 0 };
      dateMap[dateStr].total += 1;
      if (done) dateMap[dateStr].completed += 1;
    });
  });

  // Build grid: 7 rows (days of week), WEEKS columns
  const columns: { date: string; completed: number; total: number; rate: number }[][] = Array.from(
    { length: WEEKS },
    () => []
  );

  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + w * 7 + d);
      const dateStr = cellDate.toISOString().split('T')[0];
      const entry = dateMap[dateStr] || { completed: 0, total: 0 };
      const rate = entry.total > 0 ? Math.round((entry.completed / entry.total) * 100) : 0;
      columns[w].push({ date: dateStr, completed: entry.completed, total: entry.total, rate });
    }
  }

  return columns;
}

export const HabitHeatmap: React.FC<HabitHeatmapProps> = ({ habits, isLoading = false }) => {
  const [tooltip, setTooltip] = useState<{
    date: string;
    completed: number;
    total: number;
    rate: number;
    x: number;
    y: number;
  } | null>(null);

  const grid = useMemo(() => buildGrid(habits), [habits]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Consistency Heatmap</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your activity over the last {WEEKS} weeks
        </p>
      </div>

      {isLoading ? (
        <div className="h-28 rounded-xl bg-muted/30 animate-pulse" />
      ) : (
        <div className="relative">
          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 pointer-events-none bg-card border border-border-strong rounded-xl px-3 py-2 text-xs shadow-xl transform -translate-x-1/2 -translate-y-full -mt-2"
              style={{ left: tooltip.x, top: tooltip.y - 8 }}
            >
              <p className="font-semibold text-foreground">{tooltip.date}</p>
              {tooltip.total > 0 ? (
                <>
                  <p className="text-muted-foreground">
                    {tooltip.completed}/{tooltip.total} habits
                  </p>
                  <p className="text-primary font-bold">{tooltip.rate}% completion</p>
                </>
              ) : (
                <p className="text-muted-foreground">No data</p>
              )}
            </div>
          )}

          <div className="flex gap-1 overflow-x-auto pb-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-1 shrink-0">
              <div className="h-4 w-6" /> {/* spacer for top */}
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="h-3.5 flex items-center">
                  <span className="text-[9px] text-muted-foreground w-6 text-right">{d.slice(0, 1)}</span>
                </div>
              ))}
            </div>

            {/* Grid columns */}
            {grid.map((week, wi) => {
              const weekDate = week[0]?.date;
              const monthLabel = weekDate
                ? new Date(weekDate).toLocaleDateString('en-US', { month: 'short' })
                : '';
              const showMonthLabel =
                wi === 0 ||
                (week[0]?.date &&
                  new Date(week[0].date).getDate() <= 7 &&
                  new Date(week[0].date).getDate() >= 1);

              return (
                <div key={wi} className="flex flex-col gap-1 shrink-0">
                  <div className="h-4 flex items-center">
                    {showMonthLabel && (
                      <span className="text-[9px] text-muted-foreground/70">{monthLabel}</span>
                    )}
                  </div>
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      className={cn(
                        'h-3.5 w-3.5 rounded-sm cursor-pointer transition-all duration-100',
                        getIntensityClass(cell.rate),
                        'hover:ring-1 hover:ring-primary/60 hover:scale-125'
                      )}
                      onMouseEnter={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setTooltip({
                          ...cell,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px] text-muted-foreground">Less</span>
            {[0, 25, 50, 75, 100].map((v) => (
              <div
                key={v}
                className={cn('h-2.5 w-2.5 rounded-sm', getIntensityClass(v))}
              />
            ))}
            <span className="text-[10px] text-muted-foreground">More</span>
          </div>
        </div>
      )}
    </div>
  );
};
