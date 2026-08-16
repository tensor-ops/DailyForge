import React, { useState, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { ConsistencyHeatmapProps, HeatmapRange, ConsistencyDay } from './heatmap.types';
import { buildHeatmapMatrix, calculateMonthLabels, calculateHeatmapStats } from './heatmap.utils';
import { HeatmapCell } from './HeatmapCell';
import { HeatmapTooltip } from './HeatmapTooltip';
import { HeatmapLegend } from './HeatmapLegend';
import { SelectedDayDetail } from './SelectedDayDetail';
import { Flame, Trophy, TrendingUp, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({
  habits = [],
  behaviorData,
  analyticsData,
  isLoading = false,
  onOpenCreateHabit,
  className,
}) => {
  const [range, setRange] = useState<HeatmapRange>('12W');
  const [selectedDay, setSelectedDay] = useState<ConsistencyDay | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{
    day: ConsistencyDay;
    x: number;
    y: number;
  } | null>(null);

  // Matrix generation
  const weeks = useMemo(() => {
    return buildHeatmapMatrix(habits, range);
  }, [habits, range]);

  const monthLabels = useMemo(() => {
    return calculateMonthLabels(weeks);
  }, [weeks]);

  // Statistics calculation
  const stats = useMemo(() => {
    const fallbackConsistency = behaviorData?.consistencyIndex ?? analyticsData?.consistencyScore ?? 84;
    const maxStreak = behaviorData?.habitReliability?.length
      ? behaviorData.habitReliability.reduce((max, h) => Math.max(max, h.streak), 0)
      : 17;
    const consistencyChange = behaviorData?.consistencyChange ?? 6.2;

    return calculateHeatmapStats(weeks, fallbackConsistency, maxStreak, consistencyChange);
  }, [weeks, behaviorData, analyticsData]);

  // Weekday labels (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
  const weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handleCellMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, day: ConsistencyDay) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setHoveredDay({
        day,
        x: rect.left + rect.width / 2,
        y: rect.top - 4,
      });
    },
    []
  );

  const handleCellMouseLeave = useCallback(() => {
    setHoveredDay(null);
  }, []);

  const handleSelectDay = useCallback((day: ConsistencyDay) => {
    setSelectedDay((prev) => (prev?.date === day.date ? null : day));
  }, []);

  // Loading skeleton state
  if (isLoading) {
    return (
      <Card className={cn('bg-card border border-border rounded-card p-5 flex flex-col justify-between gap-4 h-full', className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5 animate-pulse">
            <div className="h-4 w-36 bg-surface-elevated rounded" />
            <div className="h-3 w-48 bg-surface-elevated/60 rounded" />
          </div>
          <div className="h-4 w-28 bg-surface-elevated rounded animate-pulse" />
        </div>
        <div className="py-4 space-y-1.5 animate-pulse">
          {Array.from({ length: 7 }).map((_, r) => (
            <div key={r} className="flex gap-1.5 justify-center">
              {Array.from({ length: 12 }).map((_, c) => (
                <div key={c} className="h-3.5 w-3.5 bg-surface-elevated/70 rounded-[3px]" />
              ))}
            </div>
          ))}
        </div>
        <div className="h-4 bg-surface-elevated/40 rounded animate-pulse" />
      </Card>
    );
  }

  // Empty state when no habits exist
  if (habits.length === 0) {
    return (
      <Card className={cn('bg-card border border-border rounded-card p-6 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[260px]', className)}>
        <div className="p-2.5 rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground">Consistency Heatmap</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Build your consistency history. Complete habits over the next few days to unlock your behavioral matrix.
          </p>
        </div>
        {onOpenCreateHabit && (
          <button
            onClick={onOpenCreateHabit}
            className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-all shadow cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Habit</span>
          </button>
        )}
      </Card>
    );
  }

  const rangeSubtitle =
    range === '12W'
      ? 'Your daily execution over the last 12 weeks'
      : range === '6M'
      ? 'Your daily execution over the last 6 months'
      : 'Your daily execution over the past year';

  return (
    <Card className={cn('bg-card border border-border rounded-card p-5 flex flex-col justify-between gap-3.5 h-full text-left', className)}>
      {/* 1. Header with Range Control and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-border/40 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground tracking-tight">Consistency Heatmap</h3>
            {/* Range Selector Pill */}
            <div className="flex items-center bg-surface-elevated border border-border/80 rounded-lg p-0.5 text-[10px] font-bold">
              {(['12W', '6M', '1Y'] as HeatmapRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    'px-2 py-0.5 rounded-md transition-all cursor-pointer',
                    range === r
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">{rangeSubtitle}</p>
        </div>

        {/* Top-Right Summary */}
        <div className="text-left sm:text-right shrink-0">
          <div className="text-xs font-extrabold text-foreground">
            {stats.averageConsistency}% average consistency
          </div>
          <div className="text-[11px] font-semibold text-emerald-500 flex items-center sm:justify-end gap-0.5 mt-0.5">
            <TrendingUp className="h-3 w-3" />
            <span>
              {stats.consistencyChange >= 0 ? `+${stats.consistencyChange}%` : `${stats.consistencyChange}%`} vs previous
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Heatmap Grid */}
      <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <div className="inline-block min-w-full">
          {/* Month Labels Row */}
          <div className="flex gap-1.5 items-center pl-5 sm:pl-6 pb-1">
            <div className="flex gap-1.5 text-[10px] font-bold text-muted-foreground/75 tracking-wider">
              {weeks.map((_, colIdx) => {
                const label = monthLabels.find((m) => m.colIndex === colIdx);
                return (
                  <div
                    key={colIdx}
                    className="w-3 sm:w-3.5 text-center flex justify-start overflow-visible whitespace-nowrap"
                  >
                    {label && <span className="text-[9px] font-extrabold">{label.month}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid Rows (Mon-Sun) */}
          <div className="flex gap-2 items-center">
            {/* Weekday Row Labels (M, T, W, T, F, S, S) */}
            <div className="flex flex-col gap-1.5 text-[9px] font-bold text-muted-foreground/70 w-3.5 justify-around select-none">
              {weekdayLabels.map((d, i) => (
                <span key={i} className="h-3 sm:h-3.5 flex items-center justify-center">
                  {d}
                </span>
              ))}
            </div>

            {/* Matrix Columns */}
            <div className="flex gap-1.5">
              {weeks.map((week) => (
                <div key={week.weekIndex} className="flex flex-col gap-1.5">
                  {week.days.map((day) => (
                    <HeatmapCell
                      key={day.date}
                      day={day}
                      isSelected={selectedDay?.date === day.date}
                      onSelect={handleSelectDay}
                      onMouseEnter={handleCellMouseEnter}
                      onMouseLeave={handleCellMouseLeave}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Selected Day Detail View (if active) */}
      {selectedDay && (
        <SelectedDayDetail day={selectedDay} onClose={() => setSelectedDay(null)} />
      )}

      {/* 4. Bottom Row: Analytical Highlights & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2 border-t border-border/40 text-xs text-muted-foreground">
        {/* Quick Highlights */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium">
          {stats.currentStreak > 0 && (
            <span className="inline-flex items-center gap-1 text-foreground/90 font-semibold">
              <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span>{stats.currentStreak}-day streak</span>
            </span>
          )}

          {stats.bestDay && (
            <>
              {stats.currentStreak > 0 && <span className="text-muted-foreground/40 select-none">·</span>}
              <span className="inline-flex items-center gap-1 text-foreground/90">
                <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>
                  Best day: <strong className="text-foreground">{stats.bestDay.dayName}</strong> ({stats.bestDay.percentage}%)
                </span>
              </span>
            </>
          )}

          {stats.bestWeek && (
            <>
              <span className="text-muted-foreground/40 select-none">·</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <span>Top week: {stats.bestWeek.rangeStr}</span>
              </span>
            </>
          )}
        </div>

        {/* Legend */}
        <HeatmapLegend />
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredDay && (
        <HeatmapTooltip
          day={hoveredDay.day}
          x={hoveredDay.x}
          y={hoveredDay.y}
          streakCount={stats.currentStreak}
        />
      )}
    </Card>
  );
};
