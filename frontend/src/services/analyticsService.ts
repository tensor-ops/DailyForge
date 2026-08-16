import { apiClient } from './api';
import {
  AnalyticsOverviewResponse,
  GrowthOverviewResponse,
  MomentumOverviewResponse,
  HabitIntelligenceSnapshot,
} from '@/types/habitIntelligence';
import { BehaviorAnalytics } from '@/types/behavior';

export const analyticsService = {
  // 1. Core Habit Intelligence Endpoints
  async getAnalyticsOverview(timeRange = '30d'): Promise<AnalyticsOverviewResponse> {
    const res = await apiClient.get<{ success: boolean; data: AnalyticsOverviewResponse }>(
      '/analytics/overview',
      { params: { range: timeRange } }
    );
    return res.data.data;
  },

  async getGrowthOverview(timeRange = '90d'): Promise<GrowthOverviewResponse> {
    const res = await apiClient.get<{ success: boolean; data: GrowthOverviewResponse }>(
      '/analytics/growth',
      { params: { range: timeRange } }
    );
    return res.data.data;
  },

  async getMomentumOverview(timeRange = '30d'): Promise<MomentumOverviewResponse> {
    const res = await apiClient.get<{ success: boolean; data: MomentumOverviewResponse }>(
      '/analytics/momentum',
      { params: { range: timeRange } }
    );
    return res.data.data;
  },

  async getHabitSnapshot(habitId: string): Promise<HabitIntelligenceSnapshot> {
    const res = await apiClient.get<{ success: boolean; data: HabitIntelligenceSnapshot }>(
      `/analytics/habits/${habitId}/snapshot`
    );
    return res.data.data;
  },

  // 2. Behavioral Intelligence Analytics
  async getBehaviorAnalytics(timeRange = '30d'): Promise<BehaviorAnalytics> {
    const res = await apiClient.get<{ success: boolean; data: BehaviorAnalytics }>(
      '/analytics/behavior',
      { params: { range: timeRange } }
    );
    return res.data.data;
  },

  async getAnalyticsSummary(timeRange = '30d'): Promise<any> {
    const res = await apiClient.get<{ success: boolean; data: any }>('/analytics/overview', {
      params: { range: timeRange },
    });
    return res.data.data;
  },

  // 3. Logging actions with flexible arguments
  async logEnergy(
    energyOrPayload: number | { energy: number; focus: number; mood: number | string; date?: string },
    focus?: number,
    mood?: number | string,
    date?: string
  ): Promise<any> {
    let payload;
    if (typeof energyOrPayload === 'object') {
      payload = energyOrPayload;
    } else {
      payload = { energy: energyOrPayload, focus, mood, date };
    }
    const res = await apiClient.post('/analytics/energy-log', payload);
    return res.data;
  },

  async logMissReason(
    habitIdOrPayload: string | { habitId: string; reason: string; notes?: string; date?: string },
    reason?: string,
    notes?: string,
    date?: string
  ): Promise<any> {
    let payload;
    if (typeof habitIdOrPayload === 'object') {
      payload = habitIdOrPayload;
    } else {
      payload = { habitId: habitIdOrPayload, reason, notes, date };
    }
    const res = await apiClient.post('/analytics/habit-miss', payload);
    return res.data;
  },

  async logHabitMiss(
    habitIdOrPayload: string | { habitId: string; reason: string; notes?: string; date?: string },
    reason?: string,
    notes?: string,
    date?: string
  ): Promise<any> {
    return this.logMissReason(habitIdOrPayload as any, reason, notes, date);
  },

  // 4. Experiments Framework
  async getExperiments(): Promise<any[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/analytics/experiments');
    return res.data.data;
  },

  async createExperiment(data: any): Promise<any> {
    const res = await apiClient.post('/analytics/experiments', data);
    return res.data;
  },

  async updateExperiment(id: string, data: any): Promise<any> {
    const res = await apiClient.patch(`/analytics/experiments/${id}`, data);
    return res.data;
  },
};
