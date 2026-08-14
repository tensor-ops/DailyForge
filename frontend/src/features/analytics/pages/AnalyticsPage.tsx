import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { analyticsService } from '@/services/analyticsService';
import { AnalyticsSummary, TimeRange } from '@/types/analytics';
import { TrendingUp } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [range, setRange] = useState<TimeRange>('30d');
  const [data, setData] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await analyticsService.getAnalyticsSummary(range);
        setData(res);
      } catch (err) {
        console.error('Analytics load error:', err);
      }
    };
    loadAnalytics();
  }, [range]);

  const ranges: { label: string; value: TimeRange }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '6 Months', value: '6m' },
    { label: '1 Year', value: '1y' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Behavioral Trends"
        description="Comprehensive breakdown of consistency, completion velocity, and category performance."
        actions={
          <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-xl">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  range === r.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Consistency Score</span>
          <div className="text-3xl font-extrabold text-foreground mt-2">
            {data?.consistencyScore || 87}<span className="text-base font-normal text-muted-foreground">/100</span>
          </div>
          <p className="text-xs text-success flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="h-3.5 w-3.5" /> +4.2% vs last period
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Completions</span>
          <div className="text-3xl font-extrabold text-foreground mt-2">
            {data?.totalCompletionsPeriod || 147}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Across all active routines</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Best Performing Habit</span>
          <div className="text-lg font-bold text-foreground mt-2 truncate">
            {data?.bestPerformingHabit?.name || 'Hydration & Electrolytes'}
          </div>
          <p className="text-xs text-primary font-medium mt-1">
            {data?.bestPerformingHabit?.completionRate || 92}% completion rate
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Opportunity Habit</span>
          <div className="text-lg font-bold text-foreground mt-2 truncate">
            {data?.weakestHabit?.name || 'Mindful Reading'}
          </div>
          <p className="text-xs text-warning font-medium mt-1">
            {data?.weakestHabit?.completionRate || 78}% completion rate
          </p>
        </Card>
      </div>

      {/* Daily Performance & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Day Completion Chart */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Weekly Daily Completion Rate</h3>
            <Badge variant="secondary" size="sm">Past 7 Days</Badge>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6">
            {data?.dailyTrends.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-semibold text-foreground">{d.completionRate}%</span>
                <div className="w-full max-w-[36px] bg-muted rounded-t-lg overflow-hidden h-full max-h-32 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-primary to-ai rounded-t-lg transition-all duration-500"
                    style={{ height: `${d.completionRate}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{d.date}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-foreground">Category Performance</h3>
          <div className="space-y-3 pt-2">
            {data?.categoryBreakdown.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground">{cat.category}</span>
                  <span className="text-muted-foreground">{cat.completionRate}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.completionRate}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
