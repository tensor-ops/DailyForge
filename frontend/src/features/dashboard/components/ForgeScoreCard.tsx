import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface ForgeScoreCardProps {
  score: number;
  consistency: number;
  completion: number;
  streak: number;
  streakDays: number;
  weekDelta?: number;
  isLoading?: boolean;
}

const SubMetric: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground w-8 text-right">{value}%</span>
    </div>
  </div>
);

export const ForgeScoreCard: React.FC<ForgeScoreCardProps> = ({
  score,
  consistency,
  completion,
  streak,
  streakDays,
  weekDelta,
  isLoading = false,
}) => {
  const chartData = [{ value: score, fill: '#6366F1' }];

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="h-48 rounded-xl bg-muted/30 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Forge Score</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Composite performance index</p>
        </div>
        {weekDelta !== undefined && (
          <div className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
            +{weekDelta} this week
          </div>
        )}
      </div>

      {/* Radial Chart */}
      <div className="relative h-40 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="90%"
            data={chartData}
            startAngle={220}
            endAngle={-40}
          >
            <PolarAngleAxis type="number" domain={[0, 1000]} tick={false} />
            <RadialBar
              background={{ fill: 'rgba(255,255,255,0.04)' }}
              dataKey="value"
              cornerRadius={8}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">{score}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary mt-0.5">
            Forge Score
          </span>
        </div>
      </div>

      {/* Sub metrics */}
      <div className="space-y-2 border-t border-border pt-3">
        <SubMetric label="Consistency" value={consistency} color="#6366F1" />
        <SubMetric label="Completion" value={completion} color="#10B981" />
        <SubMetric label="Streak Ratio" value={streak} color="#F59E0B" />
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">Current Streak</span>
          <span className="text-xs font-bold text-warning">{streakDays} days 🔥</span>
        </div>
      </div>
    </div>
  );
};
