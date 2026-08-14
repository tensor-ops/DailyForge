import { HabitCategory } from './habit';
export type { TimeRange } from './common';

export interface DailyTrendPoint {
  date: string; // 'YYYY-MM-DD' or 'Mon'
  completionRate: number;
  totalCompleted: number;
  totalHabits: number;
}

export interface CategoryBreakdown {
  category: HabitCategory;
  count: number;
  completionRate: number;
  color: string;
}

export interface HabitComparisonPoint {
  habitId: string;
  habitName: string;
  completionRate: number;
  streak: number;
}

export interface WeeklyPerformancePoint {
  week: string; // 'Week 1', 'Week 2', etc.
  rate: number;
}

export interface AnalyticsSummary {
  consistencyScore: number; // 0-100
  totalCompletionsPeriod: number;
  avgDailyRate: number;
  bestPerformingHabit: {
    id: string;
    name: string;
    streak: number;
    completionRate: number;
  } | null;
  weakestHabit: {
    id: string;
    name: string;
    streak: number;
    completionRate: number;
  } | null;
  dailyTrends: DailyTrendPoint[];
  categoryBreakdown: CategoryBreakdown[];
  habitComparisons: HabitComparisonPoint[];
  weeklyPerformance: WeeklyPerformancePoint[];
}
