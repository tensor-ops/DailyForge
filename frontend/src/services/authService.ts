import { apiClient } from './api';
import { User } from '@/types/user';

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(email: string, password?: string): Promise<AuthResponse> {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      { email, password }
    );
    const { user, token } = res.data.data;
    localStorage.setItem('ai_habit_auth_token', token);
    localStorage.setItem('daily_forge_last_user', JSON.stringify({
      name: user.name,
      streakDays: user.currentStreak || 0,
      consistency: user.overallCompletionRate || 0,
      tasksCompleted: user.totalHabitsCount || 0,
      activeGoals: user.preferences?.goals?.length || 0,
    }));
    return { user, token };
  },

  async register(
    name: string,
    email: string,
    password?: string,
    confirmPassword?: string
  ): Promise<AuthResponse> {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/auth/register',
      {
        name,
        email,
        password,
        confirmPassword: confirmPassword || password,
      }
    );
    const { user, token } = res.data.data;
    localStorage.setItem('ai_habit_auth_token', token);
    localStorage.setItem('daily_forge_last_user', JSON.stringify({
      name: user.name,
      streakDays: user.currentStreak || 0,
      consistency: user.overallCompletionRate || 0,
      tasksCompleted: user.totalHabitsCount || 0,
      activeGoals: user.preferences?.goals?.length || 0,
    }));
    return { user, token };
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('ai_habit_auth_token');
    if (!token) return null;

    try {
      const res = await apiClient.get<{ success: boolean; data: { user: User } }>(
        '/auth/me'
      );
      return res.data.data.user;
    } catch {
      localStorage.removeItem('ai_habit_auth_token');
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('ai_habit_auth_token');
    }
  },
};
