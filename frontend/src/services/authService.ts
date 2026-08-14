import { User } from '@/types/user';

const MOCK_USER: User = {
  id: 'usr_01_demo',
  name: 'Alex Vance',
  email: 'alex.vance@example.com',
  joinedDate: '2025-01-10',
  currentStreak: 12,
  longestStreak: 28,
  totalHabitsCount: 6,
  overallCompletionRate: 84,
  preferences: {
    theme: 'dark',
    emailNotifications: true,
    dailyReminderTime: '08:00',
    aiInsightsEnabled: true,
    weeklyReportEnabled: true,
  },
};

export const authService = {
  async login(email: string, _password?: string): Promise<{ user: User; token: string }> {
    // Simulating fast network latency
    await new Promise((res) => setTimeout(res, 400));
    const token = 'jwt_mock_token_' + Math.random().toString(36).substring(2);
    const user = { ...MOCK_USER, email: email || MOCK_USER.email };
    localStorage.setItem('ai_habit_auth_token', token);
    localStorage.setItem('ai_habit_user', JSON.stringify(user));
    return { user, token };
  },

  async register(name: string, email: string, _password?: string): Promise<{ user: User; token: string }> {
    await new Promise((res) => setTimeout(res, 400));
    const token = 'jwt_mock_token_' + Math.random().toString(36).substring(2);
    const user: User = {
      ...MOCK_USER,
      id: 'usr_' + Math.random().toString(36).substring(2, 8),
      name: name || 'New User',
      email: email || 'user@example.com',
      joinedDate: new Date().toISOString().split('T')[0],
      currentStreak: 0,
      longestStreak: 0,
      totalHabitsCount: 0,
      overallCompletionRate: 0,
    };
    localStorage.setItem('ai_habit_auth_token', token);
    localStorage.setItem('ai_habit_user', JSON.stringify(user));
    return { user, token };
  },

  async getCurrentUser(): Promise<User | null> {
    const saved = localStorage.getItem('ai_habit_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MOCK_USER;
      }
    }
    return MOCK_USER;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('ai_habit_auth_token');
    localStorage.removeItem('ai_habit_user');
  },
};
