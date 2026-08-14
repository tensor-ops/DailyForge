export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  timezone?: string;
  // Backend computed / cached fields (may be absent for new users)
  joinedDate?: string;
  createdAt?: string;
  currentStreak?: number;
  longestStreak?: number;
  totalHabitsCount?: number;
  overallCompletionRate?: number;
  lastLoginAt?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  dailyReminderTime?: string;
  aiInsightsEnabled: boolean;
  weeklyReportEnabled: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
