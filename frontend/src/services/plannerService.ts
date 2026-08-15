import { apiClient } from './api';

export interface PlannerDetail {
  date: string;
  habits: Array<{
    id: string;
    name: string;
    category: string;
    color: string;
    preferredTime: string;
    durationMinutes: number;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    estimatedMinutes: number;
    actualMinutes: number;
  }>;
  focusSessions: Array<{
    id: string;
    durationMinutes: number;
    focusQuality: number;
  }>;
  capacity: {
    availableMinutes: number;
    plannedMinutes: number;
    isOverloaded: boolean;
    status: 'UNDER' | 'BALANCED' | 'NEAR_LIMIT' | 'OVER_CAPACITY';
    shiftRecommendation: {
      type: string;
      action: string;
      reason: string;
      habitName: string;
    } | null;
  };
}

export const plannerService = {
  async getPlanner(date?: string): Promise<PlannerDetail> {
    const res = await apiClient.get<{ success: boolean; data: PlannerDetail }>('/planner', {
      params: { date },
    });
    return res.data.data;
  },

  async rescheduleEvent(id: string, type: 'task' | 'habit', newDate: string): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/planner/reschedule', {
      id,
      type,
      newDate,
    });
    return res.data.data;
  },
};
