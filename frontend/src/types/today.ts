import { HabitCategory, TrackingType, DifficultyLevel, FrictionLevel } from './habit';

export interface TodayGreeting {
  period: string;
  userName: string;
  title: string;
  subtitle: string;
  sparkQuote: string;
  sparkAttribution: string;
}

export interface TodayProgress {
  completed: number;
  total: number;
  remaining: number;
  percentage: number;
  habitsCompleted: number;
  habitsTotal: number;
  tasksCompleted: number;
  tasksTotal: number;
}

export interface TodayFocusTime {
  completedMinutes: number;
  plannedMinutes: number;
  formattedCompleted: string;
  formattedPlanned: string;
}

export interface TodayCapacity {
  availableMinutes: number;
  plannedMinutes: number;
  remainingMinutes: number;
  isOverloaded: boolean;
  overloadedByMinutes: number;
  formattedAvailable: string;
  formattedPlanned: string;
  formattedRemaining: string;
  status: 'BALANCED' | 'NEAR_LIMIT' | 'OVER_CAPACITY';
}

export interface TodayNextBestAction {
  id: string;
  type: 'habit' | 'task';
  title: string;
  category: string;
  reason: string;
  scheduledTime: string;
  duration: string;
  streak?: number;
  score?: number;
}

export interface TodayHabitItem {
  id: string;
  name: string;
  category: HabitCategory;
  time: string;
  rawMinutes: number;
  duration: string;
  durationMinutes: number;
  streak: number;
  completed: boolean;
  status: 'completed' | 'in_progress' | 'upcoming' | 'overdue';
  trackingType: TrackingType;
  difficulty: DifficultyLevel;
  friction: FrictionLevel;
  color?: string;
}

export interface TodayTaskItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  time: string;
  rawMinutes: number;
  duration: string;
  durationMinutes: number;
  completed: boolean;
  status: 'completed' | 'in_progress' | 'upcoming' | 'overdue';
  actualMinutes?: number;
}

export interface TodayScheduleItem {
  id: string;
  type: 'habit' | 'task';
  time: string;
  rawMinutes: number;
  event: string;
  category: string;
  duration: string;
  durationMinutes: number;
  status: 'completed' | 'in_progress' | 'upcoming' | 'overdue';
  streak?: number;
  priority?: string;
}

export interface TodayPriorityItem {
  id: string;
  rank: number;
  title: string;
  type: 'task' | 'habit' | 'goal';
  entityId: string;
  category: string;
  isCompleted: boolean;
  isSuggested: boolean;
}

export interface DailyReviewData {
  _id?: string;
  date: string;
  rating: 'great' | 'good' | 'okay' | 'difficult';
  notes: string;
  completionPercentage: number;
  completedItems: number;
  totalItems: number;
  focusMinutes: number;
  forgeNote: string;
}

export interface TodayEndOfDay {
  completedCount: number;
  totalCount: number;
  remainingCount: number;
  percentage: number;
  isReviewCompleted: boolean;
  review?: DailyReviewData | null;
  strongestHabit: string;
  needsAttention: string;
}

export interface TodayOverviewResponse {
  date: string;
  formattedDate: string;
  timezone: string;
  greeting: TodayGreeting;
  progress: TodayProgress;
  focusTime: TodayFocusTime;
  capacity: TodayCapacity;
  nextBestAction: TodayNextBestAction | null;
  habits: TodayHabitItem[];
  tasks: TodayTaskItem[];
  schedule: TodayScheduleItem[];
  priorities: TodayPriorityItem[];
  endOfDay: TodayEndOfDay;
}

export type QuickAddType = 'habit' | 'task' | 'event';
