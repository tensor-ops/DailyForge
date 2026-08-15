import React from 'react';
import { Card } from '@/components/ui/Card';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface ForgeScoreCardProps {
  score: number;
  consistency: number;
  completion: number;
  streak: number;
}

export const ForgeScoreCard: React.FC<ForgeScoreCardProps> = ({
  score,
  consistency,
  completion,
  streak,
}) => {
  // Stable mock variables for recovery and difficulty to match layout
  const difficulty = 68;
  const recovery = 88;

  const data = [
    { name: 'Recovery', value: recovery, fill: '#60A5FA' }, // Light Blue
    { name: 'Streak', value: streak > 0 ? Math.min(100, streak) : 76, fill: '#F59E0B' }, // Orange Highlight
    { name: 'Completion', value: completion || 91, fill: '#3B82F6' }, // Bright Blue
    { name: 'Consistency', value: consistency || 84, fill: '#2563EB' }, // Primary Blue
  ];

  const breakdown = [
    { name: 'Consistency', value: `${consistency || 84}%`, color: 'bg-[#2563EB]' },
    { name: 'Completion', value: `${completion || 91}%`, color: 'bg-[#3B82F6]' },
    { name: 'Streak Ratio', value: `${streak || 76}%`, color: 'bg-[#F59E0B]' },
    { name: 'Difficulty', value: `${difficulty}%`, color: 'bg-slate-500' },
    { name: 'Recovery', value: `${recovery}%`, color: 'bg-[#60A5FA]' },
  ];

  return (
    <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Forge Score</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Composite system rating</p>
      </div>

      <div className="flex flex-row items-center justify-between gap-2 flex-1 min-h-[170px]">
        {/* Radial dial */}
        <div className="w-[120px] h-[120px] shrink-0 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="100%"
              barSize={6}
              data={data}
              startAngle={90}
              endAngle={450}
            >
              <RadialBar
                background={{ fill: 'rgba(29, 41, 61, 0.2)' }}
                dataKey="value"
                cornerRadius={4}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-foreground tracking-tight leading-none">
              {score || 742}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Score
            </span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="flex-1 space-y-2.5 text-[11px] font-semibold pl-2">
          {breakdown.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2 border-b border-border/5 pb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`h-2 w-2 rounded-full shrink-0 ${item.color}`} />
                <span className="text-muted-foreground truncate">{item.name}</span>
              </div>
              <span className="text-slate-200 font-mono">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
