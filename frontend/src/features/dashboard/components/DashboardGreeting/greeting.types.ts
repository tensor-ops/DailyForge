import React from 'react';
import { User } from '@/types/user';
import { Habit } from '@/types/habit';
import { AnalyticsSummary } from '@/types/analytics';
import { BehaviorAnalytics } from '@/types/behavior';

export interface GreetingContext {
  user?: User | null;
  habits: Habit[];
  analyticsData?: AnalyticsSummary | null;
  behaviorData?: BehaviorAnalytics | null;
  currentStreak?: number;
  momentumScore?: number;
  consistencyScore?: number;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeGreetingResult {
  title: string;
  defaultSubtitle: string;
  timeOfDay: TimeOfDay;
}

export interface ContextLineData {
  streak?: number;
  completedCount: number;
  totalCount: number;
  momentumScore?: number;
}

export interface DashboardGreetingProps {
  user?: User | null;
  habits: Habit[];
  analyticsData?: AnalyticsSummary | null;
  behaviorData?: BehaviorAnalytics | null;
  currentStreak?: number;
  momentumScore?: number;
  consistencyScore?: number;
  actions?: React.ReactNode;
  className?: string;
}
