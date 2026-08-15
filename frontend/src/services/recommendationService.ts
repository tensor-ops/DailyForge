import { apiClient } from './api';

export interface Recommendation {
  id: string;
  type: 'scheduling' | 'difficulty' | 'capacity' | 'habit' | 'goal' | 'focus';
  title: string;
  description: string;
  reason: string;
  evidence?: any;
  confidence: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export const recommendationService = {
  async getRecommendations(): Promise<Recommendation[]> {
    const res = await apiClient.get<{ success: boolean; data: Recommendation[] }>('/recommendations');
    return res.data.data;
  },

  async acceptRecommendation(id: string): Promise<Recommendation> {
    const res = await apiClient.post<{ success: boolean; data: Recommendation }>(`/recommendations/${id}/accept`);
    return res.data.data;
  },

  async rejectRecommendation(id: string): Promise<Recommendation> {
    const res = await apiClient.post<{ success: boolean; data: Recommendation }>(`/recommendations/${id}/reject`);
    return res.data.data;
  },
};
