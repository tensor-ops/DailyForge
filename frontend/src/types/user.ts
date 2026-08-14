export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinedDate: string;
  currentStreak: number;
  longestStreak: number;
  totalHabitsCount: number;
  overallCompletionRate: number;
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
