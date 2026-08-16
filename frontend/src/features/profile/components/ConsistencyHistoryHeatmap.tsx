import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ConsistencyDay } from '@/types/profile';
import { Calendar, Flame } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ConsistencyHistoryHeatmapProps {
  history: ConsistencyDay[];
  currentStreak: number;
  longestStreak: number;
}

export const ConsistencyHistoryHeatmap: React.FC<ConsistencyHistoryHeatmapProps> = ({
  history,
  currentStreak,
  longestStreak,
}) => {
  const [hoveredDay, setHoveredDay] = useState<ConsistencyDay | null>(null);

  // Group days into columns of 7 (weeks)
  const weeks: ConsistencyDay[][] = [];
  let currentWeek: ConsistencyDay[] = [];

  history.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === history.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const totalCompletions = history.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="p-6 bg-surface-elevated border-border shadow-card space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Consistency History (Past 365 Days)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalCompletions.toLocaleString()} total habit executions logged across the year
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-warning">
            <Flame className="h-3.5 w-3.5 fill-warning" />
            {currentStreak}d Active
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-foreground">
            {longestStreak}d All-Time Best
          </span>
        </div>
      </div>

      {/* Heatmap Grid Container with Horizontal Scroll */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="min-w-[720px] flex gap-1 items-center">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day) => {
                let cellColor = 'bg-muted/40 border-border/30';
                if (day.level === 1) cellColor = 'bg-primary/20 border-primary/30';
                else if (day.level === 2) cellColor = 'bg-primary/45 border-primary/50';
                else if (day.level === 3) cellColor = 'bg-primary/75 border-primary/80';
                else if (day.level === 4) cellColor = 'bg-primary border-primary shadow-xs';

                return (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={cn(
                      'h-3 w-3 rounded-xs border transition-all duration-150 cursor-pointer hover:scale-125 hover:z-10',
                      cellColor
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Tooltip & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground pt-2 border-t border-border/40">
        <div className="h-4 min-w-[200px]">
          {hoveredDay ? (
            <span className="font-bold text-foreground">
              {hoveredDay.date}:{' '}
              <span className="text-primary">{hoveredDay.count} completed</span> ({hoveredDay.percentage}%)
            </span>
          ) : (
            <span>Hover over any day to inspect habit activity</span>
          )}
        </div>

        {/* Level Legend */}
        <div className="flex items-center gap-1.5 font-medium">
          <span>Less</span>
          <div className="h-2.5 w-2.5 rounded-xs bg-muted/40 border border-border/30" />
          <div className="h-2.5 w-2.5 rounded-xs bg-primary/20 border border-primary/30" />
          <div className="h-2.5 w-2.5 rounded-xs bg-primary/45 border border-primary/50" />
          <div className="h-2.5 w-2.5 rounded-xs bg-primary/75 border border-primary/80" />
          <div className="h-2.5 w-2.5 rounded-xs bg-primary border border-primary" />
          <span>More</span>
        </div>
      </div>
    </Card>
  );
};
