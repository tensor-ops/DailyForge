import { apiClient } from './api';
import { AnalyticsSummary, TimeRange } from '@/types/analytics';
import { BehaviorAnalytics, EnergyLog, Experiment } from '@/types/behavior';

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

  // Behavioral Intelligence APIs
  async getBehaviorAnalytics(range: TimeRange = '30d'): Promise<BehaviorAnalytics> {
    const res = await apiClient.get<{ success: boolean; data: BehaviorAnalytics }>(
      '/analytics/behavior',
      {
        params: { range },
      }
    );
    return res.data.data;
  },

  async logEnergy(input: { energy: number; focus: number; mood?: string; date?: string }): Promise<EnergyLog> {
    const res = await apiClient.post<{ success: boolean; data: EnergyLog }>(
      '/analytics/energy-log',
      input
    );
    return res.data.data;
  },

  async logHabitMiss(input: { habitId: string; reason: string; notes?: string; date?: string }): Promise<void> {
    await apiClient.post('/analytics/habit-miss', input);
  },

  async getExperiments(): Promise<Experiment[]> {
    const res = await apiClient.get<{ success: boolean; data: Experiment[] }>(
      '/analytics/experiments'
    );
    return res.data.data;
  },

  async createExperiment(input: {
    name: string;
    hypothesis: string;
    durationDays: number;
    baselineMetric: string;
    targetValue: number;
  }): Promise<Experiment> {
    const res = await apiClient.post<{ success: boolean; data: Experiment }>(
      '/analytics/experiments',
      input
    );
    return res.data.data;
  },

  async updateExperiment(
    id: string,
    input: { status?: 'active' | 'completed' | 'discarded'; result?: string; currentValue?: number }
  ): Promise<Experiment> {
    const res = await apiClient.patch<{ success: boolean; data: Experiment }>(
      `/analytics/experiments/${id}`,
      input
    );
    return res.data.data;
  },
};
