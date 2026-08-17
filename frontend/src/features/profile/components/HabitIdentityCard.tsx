import React from 'react';
import { Card } from '@/components/ui/Card';
import { HabitIdentityData } from '@/types/profile';
import { BookOpen, CheckCircle, Clock, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HabitIdentityCardProps {
  habitIdentity: HabitIdentityData;
}

export const HabitIdentityCard: React.FC<HabitIdentityCardProps> = ({ habitIdentity }) => {
  const strongestCategory = habitIdentity?.strongestArea?.category || 'Habits';
  const strongestRate = habitIdentity?.strongestArea?.rate ?? 85;
  const consistentHabit = habitIdentity?.mostConsistentHabit;
  const bestWindow = habitIdentity?.bestTimeWindow?.window || 'Morning';
  const bestWindowRate = habitIdentity?.bestTimeWindow?.rate ?? 87;
  const improvedHabit = habitIdentity?.mostImprovedHabit;
  const challengingHabit = habitIdentity?.mostChallengingHabit;

  return (
    <Card className="p-6 bg-surface-elevated border-border shadow-card h-full flex flex-col justify-between space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Habit Identity</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your unique behavioral signature</p>
        </div>
        <Link
          to="/dashboard?tab=habits"
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
        >
          My Habits <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strongest Area */}
        <div className="p-4 rounded-xl bg-surface border border-border/60 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span>Strongest Area</span>
          </div>
          <div className="text-sm font-black text-foreground pt-1 flex items-center justify-between">
            <span className="truncate">{strongestCategory}</span>
            <span className="text-xs font-bold text-success px-2 py-0.5 rounded-md bg-success/10 shrink-0 ml-2">
              {strongestRate}%
            </span>
          </div>
        </div>

        {/* Most Consistent Habit */}
        <div className="p-4 rounded-xl bg-surface border border-border/60 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>Most Consistent Habit</span>
          </div>
          <div className="text-sm font-black text-foreground pt-1 flex items-center justify-between truncate">
            <span className="truncate">{consistentHabit?.name || 'Daily Routine'}</span>
            <span className="text-xs font-bold text-emerald-500 shrink-0 ml-2">
              {consistentHabit?.rate ?? 88}%
            </span>
          </div>
        </div>

        {/* Best Time of Day */}
        <div className="p-4 rounded-xl bg-surface border border-border/60 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Peak Time Window</span>
          </div>
          <div className="text-sm font-black text-foreground pt-1 flex items-center justify-between truncate">
            <span className="truncate">{bestWindow}</span>
            <span className="text-xs font-bold text-amber-500 shrink-0 ml-2">
              {bestWindowRate}%
            </span>
          </div>
        </div>

        {/* Most Improved Habit */}
        <div className="p-4 rounded-xl bg-surface border border-border/60 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
            <span>Most Improved</span>
          </div>
          <div className="text-sm font-black text-foreground pt-1 flex items-center justify-between truncate">
            <span className="truncate">{improvedHabit?.name || 'Deep Focus Block'}</span>
            <span className="text-xs font-bold text-blue-500 shrink-0 ml-2">
              {improvedHabit?.delta || '+14%'}
            </span>
          </div>
        </div>
      </div>

      {/* Most Challenging Habit Notice */}
      {challengingHabit && (
        <div className="p-3.5 rounded-xl bg-surface border border-border/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
            <div>
              <span className="font-bold text-foreground block">
                Challenge Routine: {challengingHabit.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Currently averaging {challengingHabit.rate ?? 0}% completion rate.
              </span>
            </div>
          </div>
          <Link
            to="/dashboard?tab=forge-lab"
            className="text-[10px] font-extrabold text-primary hover:underline shrink-0 uppercase tracking-wider ml-2"
          >
            Optimize in Lab
          </Link>
        </div>
      )}
    </Card>
  );
};
