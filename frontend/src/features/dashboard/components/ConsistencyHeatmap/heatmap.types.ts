import { Habit } from '@/types/habit';
import { AnalyticsSummary } from '@/types/analytics';
import { BehaviorAnalytics } from '@/types/behavior';

export type HeatmapRange = '12W' | '6M' | '1Y';

export type ConsistencyLevel = -1 | 0 | 1 | 2 | 3 | 4 | 5; // -1: NO_DATA / unscheduled, 0: 0%, 1: 1-24%, 2: 25-49%, 3: 50-74%, 4: 75-99%, 5: 100%

export interface HabitOccurrence {
  id: string;
  name: string;
  category: string;
  color?: string;
  completed: boolean;
}

export interface ConsistencyDay {
  date: string; // 'YYYY-MM-DD'
  dateObj: Date;
  dayOfWeek: number; // 0=Sunday, 1=Monday... 6=Saturday
  dayIndex: number; // 0=Monday ... 6=Sunday (for row indexing)
  completed: number;
  scheduled: number;
  percentage: number;
  level: ConsistencyLevel;
  isToday: boolean;
  isFuture: boolean;
  isCurrentStreak: boolean;
  habits: HabitOccurrence[];
}

export interface HeatmapWeek {
  weekIndex: number;
  days: ConsistencyDay[]; // 7 days (Mon-Sun)
  weekStartDate: string;
  weekEndDate: string;
  avgPercentage: number;
}

export interface HeatmapMonthLabel {
  month: string;
  colIndex: number;
  span: number;
}

export interface HeatmapStats {
  averageConsistency: number;
  consistencyChange: number;
  currentStreak: number;
  totalCompleted: number;
  totalScheduled: number;
  bestDay: {
    dayName: string;
    percentage: number;
  } | null;
  bestWeek: {
    rangeStr: string;
    percentage: number;
  } | null;
  improvementVs4Weeks: number;
  hasSufficientData: boolean;
}

export interface ConsistencyHeatmapProps {
  habits?: Habit[];
  behaviorData?: BehaviorAnalytics | null;
  analyticsData?: AnalyticsSummary | null;
  isLoading?: boolean;
  onOpenCreateHabit?: () => void;
  className?: string;
}
