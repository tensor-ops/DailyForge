import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { ChartCard } from '@/components/ui/ChartCard';
import { Flame, Clock, AlertTriangle, Star } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { cn } from '@/utils/cn';

export const MomentumDashboard: React.FC = () => {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock momentum progression data
  const trendData = [
    { name: 'Week 1', momentum: 70 },
    { name: 'Week 2', momentum: 78 },
    { name: 'Week 3', momentum: 75 },
    { name: 'Week 4', momentum: 84 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Momentum"
        description="What's happening to my current trajectory?"
      />

      {/* Hero Metric & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Large Hero Metric Card */}
        <Card className="p-5 flex flex-col justify-between h-full md:col-span-2">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trajectory Hero Metric</span>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-foreground tracking-tight">84</p>
              <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-md">+12% this week</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-4 border-t border-border/40">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status:</span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              BUILDING
            </span>
          </div>
        </Card>

        {/* Recovery stats */}
        <Card className="p-5 flex flex-col justify-between h-full">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Average Recovery</span>
          <div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">1.4 days</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">Average return interval</p>
          </div>
        </Card>

        {/* Recovery rate percentage */}
        <Card className="p-5 flex flex-col justify-between h-full">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recovery Rate</span>
          <div>
            <p className="text-3xl font-extrabold text-success tracking-tight">92%</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">Pace recovery index</p>
          </div>
        </Card>
      </div>

      {/* Trajectory charts */}
      <ChartCard
        title="Momentum Trajectory"
        description="Weekly progression index tracking momentum shifts"
        actions={
          <div className="flex bg-surface-sunken p-1 border border-border rounded-xl text-xs font-bold text-muted-foreground w-max shrink-0">
            {([
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRange(opt.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg uppercase tracking-wide cursor-pointer transition-colors focus:outline-none',
                  range === opt.id
                    ? 'bg-primary text-primary-foreground font-extrabold'
                    : 'hover:text-foreground hover:bg-muted/30'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="h-[240px] text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="momGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(var(--color-primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="rgb(var(--color-primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-chart-grid) / 0.4)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'rgb(var(--color-chart-text))', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgb(var(--color-chart-text))', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--color-chart-tooltip-bg))',
                  borderColor: 'rgb(var(--color-chart-tooltip-border))',
                  borderRadius: '10px',
                  color: 'rgb(var(--color-foreground))',
                }}
                itemStyle={{ fontSize: 11 }}
                labelStyle={{ color: 'rgb(var(--color-muted-foreground))', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="momentum" stroke="rgb(var(--color-primary))" strokeWidth={2.2} fill="url(#momGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Main split grid: Streak/Drivers vs At-Risk and Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left main: Streaks and Drivers */}
        <div className="lg:col-span-2 space-y-5">
          {/* Streak History */}
          <Card className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Streak History</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Consecutive completion milestones</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
              <div className="p-3 bg-surface-elevated border border-border rounded-xl text-left">
                <span className="text-[10px] text-muted-foreground block">Current Streak</span>
                <span className="text-warning font-extrabold text-sm flex items-center gap-0.5 mt-0.5">
                  <Flame className="h-4 w-4 fill-warning text-warning" /> 17 Days
                </span>
              </div>
              <div className="p-3 bg-surface-elevated border border-border rounded-xl text-left">
                <span className="text-[10px] text-muted-foreground block font-bold">Longest Streak</span>
                <span className="text-foreground font-extrabold text-sm flex items-center gap-0.5 mt-0.5">
                  🔥 22 Days
                </span>
              </div>
              <div className="p-3 bg-surface-elevated border border-border rounded-xl text-left">
                <span className="text-[10px] text-muted-foreground block font-bold">Recent Milestones</span>
                <span className="text-muted-foreground font-medium block mt-1">10-day (Aug 8)</span>
              </div>
            </div>
          </Card>

          {/* Momentum Drivers */}
          <Card className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Momentum Drivers</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Routines generating the strongest consistency trends</p>
            </div>
            
            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex justify-between items-center p-3 bg-surface-elevated border border-border rounded-xl">
                <span className="flex items-center gap-1.5 text-foreground"><Clock className="h-4 w-4 text-success" /> Exercise</span>
                <span className="text-success font-extrabold">+18%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-elevated border border-border rounded-xl">
                <span className="flex items-center gap-1.5 text-foreground"><Clock className="h-4 w-4 text-success" /> DSA Practice</span>
                <span className="text-success font-extrabold">+12%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-elevated border border-border rounded-xl">
                <span className="flex items-center gap-1.5 text-foreground"><Clock className="h-4 w-4 text-warning" /> Reading</span>
                <span className="text-warning font-extrabold">-14%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right side: At-Risk & Recommendation */}
        <div className="space-y-5">
          {/* At-Risk Habits */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-border/50 pb-2">
              <AlertTriangle className="h-4.5 w-4.5 text-warning animate-pulse" />
              <h3 className="text-xs font-bold text-warning uppercase tracking-wider">At-Risk Habits</h3>
            </div>
            
            <div className="space-y-3 text-xs font-semibold">
              <div className="p-3 bg-surface-elevated border border-border rounded-xl text-left">
                <span className="text-[10px] text-muted-foreground block">Reading</span>
                <p className="text-warning mt-0.5">Momentum declining by -14%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Reason: Wrong scheduled time block</p>
              </div>
            </div>
          </Card>

          {/* Recommendation */}
          <Card className="bg-primary/5 border-primary/20 p-5 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-primary/20 pb-2">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Recommendation</h4>
            </div>
            <p className="text-xs text-foreground leading-relaxed font-semibold">
              &quot;Protect your strongest momentum driver.&quot; Keep Exercise locked at 6:30 PM to anchor same-day completions.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
