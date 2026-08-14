import React from 'react';
import { AnalyticsSummary } from '@/types/analytics';

interface MiniAnalyticsProps {
  analyticsData: AnalyticsSummary | null;
  isLoading?: boolean;
}

export const MiniAnalytics: React.FC<MiniAnalyticsProps> = ({ analyticsData, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!analyticsData) return null;

  // Determine best day of week from dailyTrends
  const bestDay =
    analyticsData.dailyTrends?.length > 0
      ? analyticsData.dailyTrends.reduce((best, d) =>
          d.completionRate > best.completionRate ? d : best
        )
      : null;

  const tiles = [
    {
      label: 'Best Day',
      value: bestDay
        ? new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'short' })
        : '—',
      sub: bestDay ? `${bestDay.completionRate}%` : 'No data',
      color: 'text-primary',
    },
    {
      label: 'Top Habit',
      value: analyticsData.bestPerformingHabit?.name?.split(' ')[0] || '—',
      sub: analyticsData.bestPerformingHabit
        ? `${analyticsData.bestPerformingHabit.completionRate}% rate`
        : 'No data',
      color: 'text-success',
    },
    {
      label: 'Avg Daily',
      value: analyticsData.avgDailyRate ? `${Math.round(analyticsData.avgDailyRate)}%` : '—',
      sub: 'Completion rate',
      color: 'text-foreground',
    },
    {
      label: 'Consistency',
      value: analyticsData.consistencyScore ? `${Math.round(analyticsData.consistencyScore)}` : '—',
      sub: 'Score / 100',
      color: 'text-ai',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {tiles.map((tile, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {tile.label}
          </span>
          <span className={`text-xl font-extrabold tracking-tight ${tile.color}`}>{tile.value}</span>
          <span className="text-[11px] text-muted-foreground">{tile.sub}</span>
        </div>
      ))}
    </div>
  );
};
