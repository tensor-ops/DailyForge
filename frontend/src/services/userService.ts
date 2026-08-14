import { apiClient } from './api';
import { User, UserPreferences } from '@/types/user';

export const userService = {
  async getProfile(): Promise<User> {
    const res = await apiClient.get<{ success: boolean; data: User }>('/users/me');
    return res.data.data;
  },

  async updateProfile(data: {
    name?: string;
    avatarUrl?: string;
    timezone?: string;
    preferences?: Partial<UserPreferences>;
  }): Promise<User> {
    const res = await apiClient.patch<{ success: boolean; data: User }>('/users/me', data);
    return res.data.data;
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<User> {
    const res = await apiClient.patch<{ success: boolean; data: User }>(
      '/users/me/preferences',
      { preferences }
    );
    return res.data.data;
  },
};
