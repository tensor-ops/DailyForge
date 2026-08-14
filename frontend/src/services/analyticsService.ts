import { apiClient } from './api';
import { AnalyticsSummary, TimeRange } from '@/types/analytics';

export const analyticsService = {
  async getAnalyticsSummary(range: TimeRange = '30d'): Promise<AnalyticsSummary> {
    const res = await apiClient.get<{ success: boolean; data: AnalyticsSummary }>(
      '/analytics/overview',
      {
        params: { range },
      }
    );
    return res.data.data;
  },

  async getCompletionTrends(range: TimeRange = '30d') {
    const res = await apiClient.get('/analytics/completion-trend', { params: { range } });
    return res.data.data;
  },

  async getCategoryPerformance(range: TimeRange = '30d') {
    const res = await apiClient.get('/analytics/category-performance', { params: { range } });
    return res.data.data;
  },

  async getConsistency() {
    const res = await apiClient.get('/analytics/consistency');
    return res.data.data;
  },
};
