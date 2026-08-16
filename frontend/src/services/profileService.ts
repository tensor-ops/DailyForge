import { apiClient } from './api';
import { CompleteProfileResponse, UpdateProfileInput } from '@/types/profile';

export const profileService = {
  /**
   * Fetches the aggregated complete profile data.
   */
  async getProfile(): Promise<CompleteProfileResponse> {
    const res = await apiClient.get<{ success: boolean; data: CompleteProfileResponse }>('/profile');
    return res.data.data;
  },

  /**
   * Updates user editable profile details.
   */
  async updateProfile(data: UpdateProfileInput): Promise<CompleteProfileResponse> {
    const res = await apiClient.patch<{ success: boolean; data: CompleteProfileResponse }>('/profile', data);
    return res.data.data;
  },

  /**
   * Changes the user's password.
   */
  async changePassword(passwords: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const res = await apiClient.post<{ success: boolean; data: { message: string } }>('/profile/change-password', passwords);
    return res.data.data;
  },

  /**
   * Triggers download of complete user data as JSON.
   */
  async exportData(): Promise<Blob> {
    const res = await apiClient.get('/profile/export', {
      responseType: 'blob',
    });
    return res.data;
  },

  /**
   * Deletes the user account permanently / soft-deletes.
   */
  async deleteAccount(password: string): Promise<void> {
    await apiClient.delete('/profile', { data: { password } });
  },
};
