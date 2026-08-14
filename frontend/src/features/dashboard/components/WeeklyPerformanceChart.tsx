import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { AnalyticsSummary, TimeRange } from '@/types/analytics';
import { analyticsService } from '@/services/analyticsService';
import { useEffect } from 'react';

const TIME_TABS: { label: string; value: TimeRange }[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y', value: '1y' },
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
};

interface WeeklyPerformanceChartProps {
  initialData?: AnalyticsSummary | null;
}

export const WeeklyPerformanceChart: React.FC<WeeklyPerformanceChartProps> = ({ initialData }) => {
  const [range, setRange] = useState<TimeRange>('7d');
  const [data, setData] = useState<{ date: string; completion: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await analyticsService.getAnalyticsSummary(range);
        const mapped = (res.dailyTrends || []).map((d) => ({
          date: d.date,
          completion: d.completionRate,
        }));
        setData(mapped);
      } catch {
        // show empty state
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [range]);

  // Also seed from parent if provided
  useEffect(() => {
    if (initialData?.dailyTrends?.length) {
      setData(
        initialData.dailyTrends.map((d) => ({
          date: d.date,
          completion: d.completionRate,
        }))
      );
      setIsLoading(false);
    }
  }, [initialData]);

  const avgCompletion =
    data.length > 0 ? Math.round(data.reduce((s, d) => s + d.completion, 0) / data.length) : 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Weekly Performance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Habit completion over time</p>
        </div>
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
          {TIME_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setRange(t.value)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                range === t.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Avg stat */}
      {!isLoading && data.length > 0 && (
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">{avgCompletion}%</span>
          <span className="text-xs text-muted-foreground">avg completion</span>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 min-h-[160px]">
        {isLoading ? (
          <div className="h-full rounded-xl bg-muted/30 animate-pulse" />
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No performance data for this period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="completion"
                name="Completion"
                stroke="#6366F1"
                strokeWidth={2}
                fill="url(#completionGrad)"
                dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
