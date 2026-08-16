export type HabitCategory =
  | 'Health'
  | 'Fitness'
  | 'Study'
  | 'Work'
  | 'Personal'
  | 'Finance'
  | 'Mindfulness'
  | 'Creativity'
  | 'Other';

export type HabitFrequency =
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'specific_days'
  | 'weekly'
  | 'custom';

export type TrackingType =
  | 'binary'
  | 'duration'
  | 'count'
  | 'quantity'
  | 'checklist';

export type DifficultyLevel = 'easy' | 'moderate' | 'challenging';

export type FrictionLevel = 'low' | 'medium' | 'high';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  icon: string;
  trackingType: TrackingType;
  frequency: HabitFrequency;
  customDays?: number[]; // 0=Sunday, 1=Monday, etc.
  targetValue?: number;
  unit?: string;
  preferredTime?: string;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  reminderDays?: number[];
  difficulty?: DifficultyLevel;
  expectedFriction?: FrictionLevel;
  checklistItems?: string[];
  startDate: string;
  color?: string;
  isArchived: boolean;
  lastCompletedAt?: string | null; // YYYY-MM-DD

  // Computed / cached stats
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0 to 100
  completedToday: boolean;
  history?: Record<string, boolean>; // 'YYYY-MM-DD' -> true/false
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedHabit extends Habit {
  reliability: number;
  consistency: number;
  friction: 'LOW' | 'MEDIUM' | 'HIGH';
  stabilityRisk: 'STABLE' | 'WATCH' | 'AT_RISK' | 'HIGH_RISK';
  stabilityTrend: number;
  bestTime: string;
  progress: number;
  isNew: boolean;
  isStrong: boolean;
  isAtRisk: boolean;
}

export interface HabitHealthDistribution {
  strong: number;
  stable: number;
  atRisk: number;
  total: number;
}

export interface HabitSummary {
  activeHabits: number;
  averageReliability: number;
  averageCompletion: number;
  atRisk: number;
  strong: number;
  bestCurrentStreak: number;
  healthDistribution: HabitHealthDistribution;
  pulse: string | null;
}

export interface HabitsOverviewResponse {
  summary: HabitSummary;
  habits: EnrichedHabit[];
}

export interface HabitFilterOptions {
  status: 'all' | 'active' | 'completed' | 'archived';
  category?: HabitCategory | 'all';
  searchQuery?: string;
  sortBy?: 'name' | 'streak' | 'completionRate' | 'createdDate';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  category: HabitCategory;
  icon?: string;
  trackingType?: TrackingType;
  frequency?: HabitFrequency;
  customDays?: number[];
  targetValue?: number;
  unit?: string;
  preferredTime?: string;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  reminderDays?: number[];
  difficulty?: DifficultyLevel;
  expectedFriction?: FrictionLevel;
  checklistItems?: string[];
  startDate?: string;
  color?: string;
}

export interface HabitMissReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface HabitDailyTrend {
  date: string;
  scheduled: boolean;
  completed: boolean;
}

export interface HabitAnalytics {
  habitId: string;
  name: string;
  category: HabitCategory;
  trackingType: TrackingType;
  targetValue: number;
  unit: string;
  preferredTime: string;
  difficulty: DifficultyLevel;
  expectedFriction: FrictionLevel;
  reliability: number;
  consistency: number;
  currentStreak: number;
  longestStreak: number;
  progress: number;
  friction: 'LOW' | 'MEDIUM' | 'HIGH';
  stabilityRisk: 'STABLE' | 'WATCH' | 'AT_RISK' | 'HIGH_RISK';
  stabilityTrend: number;
  bestTime: string;
  totalScheduled: number;
  totalCompleted: number;
  totalMissed: number;
  completionRate: number;
  missReasons: HabitMissReason[];
  dailyTrend: HabitDailyTrend[];
  aiSuggestion: string | null;
}
