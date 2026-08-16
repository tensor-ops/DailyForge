import React, { useMemo } from 'react';
import { DashboardGreetingProps, GreetingContext } from './greeting.types';
import {
  formatFirstName,
  getTimeGreeting,
  getIntelligentSubtitle,
  getBehavioralMicroInsight,
} from './greeting.utils';
import { Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export const DashboardGreeting: React.FC<DashboardGreetingProps> = ({
  user,
  habits,
  analyticsData,
  behaviorData,
  currentStreak,
  momentumScore,
  consistencyScore,
  actions,
  className,
}) => {
  const firstName = useMemo(() => formatFirstName(user?.name), [user?.name]);

  const { title, defaultSubtitle } = useMemo(
    () => getTimeGreeting(firstName),
    [firstName]
  );

  const context: GreetingContext = useMemo(
    () => ({
      user,
      habits,
      analyticsData,
      behaviorData,
      currentStreak,
      momentumScore,
      consistencyScore,
    }),
    [user, habits, analyticsData, behaviorData, currentStreak, momentumScore, consistencyScore]
  );

  const subtitle = useMemo(
    () => getIntelligentSubtitle(context, defaultSubtitle),
    [context, defaultSubtitle]
  );

  const microInsight = useMemo(
    () => getBehavioralMicroInsight(context),
    [context]
  );

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;

  const effectiveStreak =
    currentStreak !== undefined
      ? currentStreak
      : behaviorData?.habitReliability?.length
      ? behaviorData.habitReliability.reduce((max, h) => Math.max(max, h.streak), 0)
      : undefined;

  const effectiveMomentum =
    momentumScore !== undefined
      ? momentumScore
      : behaviorData?.momentum?.score;

  return (
    <header
      className={cn(
        'relative border-b border-border/70 pb-5 pt-1 text-left select-none transition-colors',
        className
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left column: Hero copy & contextual snapshot */}
        <div className="space-y-1.5 flex-1 min-w-0">
          {/* 1. Main Greeting Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-extrabold tracking-tight text-foreground leading-tight motion-safe:animate-fade-in">
              {title}
            </h1>
            {/* Subtle Daily Forge Orange Brand Accent Line */}
            <div className="hidden sm:block h-2 w-2 rounded-full bg-orange-500/80 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
          </div>

          {/* 2. Intelligent Subtitle */}
          <p className="text-sm sm:text-base text-muted-foreground font-medium leading-normal motion-safe:animate-fade-in [animation-delay:80ms]">
            {subtitle}
          </p>

          {/* 3. Compact Contextual Snapshot */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground pt-1 motion-safe:animate-fade-in [animation-delay:160ms]">
            {effectiveStreak !== undefined && effectiveStreak > 0 && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground/90">
                <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <span>{effectiveStreak} day streak</span>
              </span>
            )}

            {effectiveStreak !== undefined && effectiveStreak > 0 && totalCount > 0 && (
              <span className="text-muted-foreground/40 select-none">·</span>
            )}

            {totalCount > 0 && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground/90">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>
                  {completedCount}/{totalCount} completed
                </span>
              </span>
            )}

            {effectiveMomentum !== undefined && (
              <>
                {(totalCount > 0 || (effectiveStreak !== undefined && effectiveStreak > 0)) && (
                  <span className="text-muted-foreground/40 select-none">·</span>
                )}
                <span className="inline-flex items-center gap-1 font-medium text-foreground/90">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span>Momentum {effectiveMomentum}</span>
                </span>
              </>
            )}
          </div>

          {/* 4. Behavioral Micro-Insight (Shown only when real historical data exists) */}
          {microInsight && (
            <div className="pt-0.5 text-xs text-muted-foreground/75 flex items-center gap-1.5 motion-safe:animate-fade-in [animation-delay:240ms]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
              <span>{microInsight}</span>
            </div>
          )}
        </div>

        {/* Right column: Action buttons */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0 self-start lg:self-center motion-safe:animate-fade-in [animation-delay:120ms]">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};
