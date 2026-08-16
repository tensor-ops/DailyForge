import { apiClient } from './api';
import {
  PlannerOverviewResponse,
  CalendarEvent,
  AutoSchedulePreviewResponse,
} from '@/types/planner';

export const plannerService = {
  async getPlannerOverview(params?: {
    date?: string;
    view?: 'day' | 'week' | 'month';
    startDate?: string;
    endDate?: string;
  }): Promise<PlannerOverviewResponse> {
    const res = await apiClient.get<{ success: boolean; data: PlannerOverviewResponse }>('/planner', {
      params,
    });
    return res.data.data;
  },

  async createEvent(data: Partial<CalendarEvent>): Promise<PlannerOverviewResponse> {
    const res = await apiClient.post<{ success: boolean; data: PlannerOverviewResponse }>(
      '/planner/events',
      data
    );
    return res.data.data;
  },

  async updateEvent(id: string, data: Partial<CalendarEvent>): Promise<PlannerOverviewResponse> {
    const res = await apiClient.patch<{ success: boolean; data: PlannerOverviewResponse }>(
      `/planner/events/${id}`,
      data
    );
    return res.data.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`/planner/events/${id}`);
  },

  async completeEvent(id: string): Promise<PlannerOverviewResponse> {
    const res = await apiClient.post<{ success: boolean; data: PlannerOverviewResponse }>(
      `/planner/events/${id}/complete`
    );
    return res.data.data;
  },

  async rescheduleEvent(payload: {
    id: string;
    newDate?: string;
    newStartTime?: string;
    newEndTime?: string;
  }): Promise<PlannerOverviewResponse> {
    const res = await apiClient.post<{ success: boolean; data: PlannerOverviewResponse }>(
      '/planner/events/reschedule',
      payload
    );
    return res.data.data;
  },

  async applyRecommendation(payload: {
    eventId?: string | null;
    targetDate?: string;
  }): Promise<PlannerOverviewResponse> {
    const res = await apiClient.post<{ success: boolean; data: PlannerOverviewResponse }>(
      '/planner/recommendations/apply',
      payload
    );
    return res.data.data;
  },

  async getAutoSchedulePreview(date?: string): Promise<AutoSchedulePreviewResponse> {
    const res = await apiClient.get<{ success: boolean; data: AutoSchedulePreviewResponse }>(
      '/planner/auto-schedule/preview',
      { params: { date } }
    );
    return res.data.data;
  },

  async applyAutoSchedule(date: string, events: any[]): Promise<PlannerOverviewResponse> {
    const res = await apiClient.post<{ success: boolean; data: PlannerOverviewResponse }>(
      '/planner/auto-schedule/apply',
      { date, events }
    );
    return res.data.data;
  },
};
