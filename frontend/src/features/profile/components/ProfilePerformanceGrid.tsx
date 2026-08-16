import React from 'react';
import { Card } from '@/components/ui/Card';
import { ProfilePerformance } from '@/types/profile';
import { Zap, TrendingUp, CheckCircle2, RotateCcw, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfilePerformanceGridProps {
  performance: ProfilePerformance;
}

export const ProfilePerformanceGrid: React.FC<ProfilePerformanceGridProps> = ({ performance }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Current Performance Engine
        </h2>
        <Link
          to="/dashboard?tab=analytics"
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
        >
          View Full Analytics <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Forge Score Card */}
        <Link to="/dashboard?tab=analytics" className="block group">
          <Card className="p-5 h-full transition-all duration-200 hover:border-primary/50 hover:shadow-card bg-surface-elevated">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Forge Score
              </span>
              <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-4 w-4 fill-primary" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {performance.forgeScore}
              </span>
              <span className="text-xs font-bold text-success flex items-center gap-0.5">
                {performance.forgeScoreChange}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Momentum Status</span>
              <span className="font-bold text-primary uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-primary/10">
                {performance.momentum.status}
              </span>
            </div>
          </Card>
        </Link>

        {/* 2. Consistency Index */}
        <Link to="/dashboard?tab=growth" className="block group">
          <Card className="p-5 h-full transition-all duration-200 hover:border-primary/50 hover:shadow-card bg-surface-elevated">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Consistency Index
              </span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {performance.consistency}%
              </span>
              <span className="text-xs text-muted-foreground font-medium">30-day index</span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, performance.consistency)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground block text-right font-medium">
                High execution stability
              </span>
            </div>
          </Card>
        </Link>

        {/* 3. Execution Rate */}
        <Link to="/dashboard?tab=today" className="block group">
          <Card className="p-5 h-full transition-all duration-200 hover:border-primary/50 hover:shadow-card bg-surface-elevated">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Execution Rate
              </span>
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {performance.execution}%
              </span>
              <span className="text-xs text-muted-foreground font-medium">Planned vs Done</span>
            </div>

            <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, performance.execution)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground block text-right font-medium">
                Reliability: {performance.reliability}%
              </span>
            </div>
          </Card>
        </Link>

        {/* 4. Recovery Velocity */}
        <Link to="/dashboard?tab=momentum" className="block group">
          <Card className="p-5 h-full transition-all duration-200 hover:border-primary/50 hover:shadow-card bg-surface-elevated">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Recovery Velocity
              </span>
              <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RotateCcw className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {performance.recovery}%
              </span>
              <span className="text-xs text-muted-foreground font-medium">Post-miss rebound</span>
            </div>

            <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, performance.recovery)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground block text-right font-medium">
                Avg rebound: 1.3 days
              </span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};
