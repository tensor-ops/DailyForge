import React from 'react';
import { Card } from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface WeeklyActivityChartProps {
  completedHabitsCount: number;
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ completedHabitsCount }) => {
  const todayIdx = new Date().getDay(); // 0 is Sunday, 1 is Monday, ...
  const adjustedIdx = todayIdx === 0 ? 6 : todayIdx - 1; // map Sunday to index 6, Monday to 0, ...

  const baseData = [
    { name: 'Mon', habits: 4, tasks: 2 },
    { name: 'Tue', habits: 5, tasks: 3 },
    { name: 'Wed', habits: 6, tasks: 4 },
    { name: 'Thu', habits: 3, tasks: 1 },
    { name: 'Fri', habits: 5, tasks: 3 },
    { name: 'Sat', habits: 2, tasks: 2 },
    { name: 'Sun', habits: 4, tasks: 1 },
  ];

  if (baseData[adjustedIdx]) {
    baseData[adjustedIdx].habits = completedHabitsCount > 0 ? completedHabitsCount : baseData[adjustedIdx].habits;
  }

  return (
    <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Weekly Activity</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Habits and tasks completed by day</p>
      </div>

      <div className="flex-1 min-h-[200px] text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={baseData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(29, 41, 61, 0.3)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#101622', borderColor: '#1D293D', borderRadius: '10px' }}
              itemStyle={{ fontSize: 11 }}
              labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
            />
            <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
            <Bar dataKey="habits" name="Habits Completed" fill="#2563EB" radius={[4, 4, 0, 0]} />
            <Bar dataKey="tasks" name="Tasks Completed" fill="#475569" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
