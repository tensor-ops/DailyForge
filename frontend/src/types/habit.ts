export type HabitCategory =
  | 'Health'
  | 'Fitness'
  | 'Study'
  | 'Work'
  | 'Personal'
  | 'Finance'
  | 'Mindfulness'
  | 'Other';

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  icon: string;
  frequency: HabitFrequency;
  customDays?: number[]; // 0=Sunday, 1=Monday, etc.
  targetValue?: number;
  unit?: string;
  reminderTime?: string;
  startDate: string;
  color?: string;
  isArchived: boolean;
  
  // Computed stats
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0 to 100
  completedToday: boolean;
  history: Record<string, boolean>; // 'YYYY-MM-DD' -> true/false
  createdAt: string;
  updatedAt: string;
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
  icon: string;
  frequency: HabitFrequency;
  customDays?: number[];
  targetValue?: number;
  unit?: string;
  reminderTime?: string;
  startDate: string;
  color?: string;
}
