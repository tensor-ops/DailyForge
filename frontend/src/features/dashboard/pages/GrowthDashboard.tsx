import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TrendingUp, Award, Sparkles, Zap } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { cn } from '@/utils/cn';

export const GrowthDashboard: React.FC = () => {
  const [range, setRange] = useState<'30d' | '90d' | '6m' | '1y'>('90d');

  // Mock long term progression data representing compounding growth
  const growthTrend = [
    { name: 'Month 1', consistency: 72, execution: 76, reliability: 61, recovery: 65 },
    { name: 'Month 2', consistency: 75, execution: 79, reliability: 68, recovery: 70 },
    { name: 'Month 3', consistency: 80, execution: 82, reliability: 74, recovery: 75 },
    { name: 'Month 4', consistency: 84, execution: 89, reliability: 82, recovery: 80 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Growth"
        description="See how your behavior compounds over time."
      />

      {/* Top Growth Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="30-Day Growth"
          value="+14%"
          subtext="Recent improvement"
          icon={TrendingUp}
          accent="blue"
        />
        <MetricCard
          title="90-Day Growth"
          value="+28%"
          subtext="Long-term trajectory"
          icon={TrendingUp}
          accent="blue"
        />
        <MetricCard
          title="Consistency Growth"
          value="+12%"
          subtext="Routine stability"
          icon={Sparkles}
          accent="green"
        />
        <MetricCard
          title="Execution Growth"
          value="+18%"
          subtext="Task completion rates"
          icon={Zap}
          accent="orange"
        />
      </div>

      {/* Long term trend chart */}
      <ChartCard
        title="Long-Term Growth Progression"
        description="Compounding consistency, execution, reliability, and recovery over time"
        actions={
          <div className="flex bg-card p-1 border border-border rounded-xl text-xs font-bold text-muted-foreground w-max shrink-0">
            {([
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: '6m', label: '6M' },
              { id: '1y', label: '1Y' },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRange(opt.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg uppercase tracking-wide cursor-pointer transition-colors focus:outline-none',
                  range === opt.id
                    ? 'bg-primary text-foreground font-extrabold'
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
            <LineChart data={growthTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(29, 41, 61, 0.2)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#101622', borderColor: '#1D293D', borderRadius: '10px' }}
                itemStyle={{ fontSize: 11 }}
                labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="consistency" name="Consistency" stroke="#2563EB" strokeWidth={2.2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="execution" name="Execution" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="reliability" name="Reliability" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="recovery" name="Recovery" stroke="#22D3EE" strokeWidth={1.8} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Main split grid: Before vs Now & Category growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left main: Before vs Now Comparison */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Before vs Now</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Performance metrics shift since your baseline establishment</p>
            </div>
            
            <div className="space-y-4 text-xs font-semibold text-muted-foreground">
              <div className="flex justify-between items-center p-3 bg-surface-elevated border border-border/60 rounded-xl">
                <span>Consistency</span>
                <span className="text-foreground font-extrabold">72% → <strong className="text-success font-extrabold text-sm pl-1">84%</strong></span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-elevated border border-border/60 rounded-xl">
                <span>Execution</span>
                <span className="text-foreground font-extrabold">76% → <strong className="text-success font-extrabold text-sm pl-1">89%</strong></span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-elevated border border-border/60 rounded-xl">
                <span>Recovery Rate</span>
                <span className="text-foreground font-extrabold">61% → <strong className="text-success font-extrabold text-sm pl-1">82%</strong></span>
              </div>
            </div>
          </Card>

          {/* Category Growth breakdown */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Category Growth Margin</h3>
            <div className="space-y-3 text-xs font-semibold text-muted-foreground">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Learning / Study</span>
                  <span className="text-primary font-bold">+21%</span>
                </div>
                <ProgressBar value={21 * 4} accent="blue" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Health</span>
                  <span className="text-success font-bold">+14%</span>
                </div>
                <ProgressBar value={14 * 6} accent="green" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Career / Work</span>
                  <span className="text-warning font-bold">+9%</span>
                </div>
                <ProgressBar value={9 * 9} accent="orange" />
              </div>
            </div>
          </Card>
        </div>

        {/* Right side: Personal records & growth insight card */}
        <div className="space-y-5">
          {/* Personal Records */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-border/10 pb-2">
              <Award className="h-4.5 w-4.5 text-warning animate-pulse" />
              <h3 className="text-xs font-bold text-warning uppercase tracking-wider">Personal Records</h3>
            </div>
            
            <div className="space-y-3.5 text-xs font-semibold text-muted-foreground">
              <div>
                <span className="text-[10px] text-muted-foreground block">Best Week</span>
                <span className="text-foreground font-extrabold">96% Completion Rate</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Longest Streak</span>
                <span className="text-warning font-extrabold">🔥 22 Days (Hydration)</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Highest Forge Score</span>
                <span className="text-primary font-extrabold">784 Points</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Best Recovery</span>
                <span className="text-foreground">1 day return interval</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Best Completion Day</span>
                <span className="text-success">Wednesday (avg 94%)</span>
              </div>
            </div>
          </Card>

          {/* Growth Insight */}
          <Card className="bg-primary/5 border border-primary/20 rounded-card p-5 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-border/10 pb-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Growth Insight</h4>
            </div>
            <p className="text-xs text-foreground leading-relaxed font-semibold">
              Your strongest improvement has been consistency. Moving Reading and DSA Practice to their optimal windows reduced weekly friction by 32%.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
