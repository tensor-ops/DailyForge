import { apiClient } from './api';
import { TodayOverviewResponse, DailyReviewData } from '@/types/today';
import { HabitCategory } from '@/types/habit';

export const todayService = {
  async getTodayOverview(date?: string): Promise<TodayOverviewResponse> {
    const params = date ? { date } : {};
    const res = await apiClient.get<{ success: boolean; data: TodayOverviewResponse }>('/today', {
      params,
    });
    return res.data.data;
  },

  async submitDailyReview(
    rating: 'great' | 'good' | 'okay' | 'difficult',
    notes: string = '',
    date?: string
  ): Promise<{ review: DailyReviewData; forgeNote: string }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { review: DailyReviewData; forgeNote: string };
    }>('/today/review', { rating, notes, date });
    return res.data.data;
  },

  async rescheduleItem(
    id: string,
    type: 'habit' | 'task',
    newTime?: string,
    newDate?: string
  ): Promise<void> {
    await apiClient.post('/today/reschedule', { id, type, newTime, newDate });
  },

  async quickAddHabit(data: {
    name: string;
    category: HabitCategory;
    preferredTime?: string;
    duration?: number;
    description?: string;
  }): Promise<void> {
    await apiClient.post('/habits', {
      name: data.name,
      category: data.category,
      preferredTime: data.preferredTime || '08:00 AM',
      frequency: 'daily',
      trackingType: data.duration ? 'duration' : 'binary',
      targetValue: data.duration || 1,
      unit: data.duration ? 'minutes' : 'times',
      description: data.description || '',
    });
  },

  async quickAddTask(data: {
    title: string;
    scheduledStart?: string;
    estimatedMinutes?: number;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    description?: string;
  }): Promise<void> {
    await apiClient.post('/tasks', {
      title: data.title,
      scheduledStart: data.scheduledStart,
      estimatedMinutes: data.estimatedMinutes || 30,
      priority: data.priority || 'medium',
      description: data.description || '',
    });
  },

  async toggleTaskComplete(taskId: string, currentStatus: string): Promise<void> {
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    await apiClient.patch(`/tasks/${taskId}`, { status: newStatus });
  },

  async logFocusSession(data: {
    habitId?: string;
    taskId?: string;
    goalId?: string;
    durationMinutes: number;
    focusQuality?: number; // 1-10
    distractionCount?: number;
    startedAt?: string;
    endedAt?: string;
  }): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(
      '/today/focus-session',
      data
    );
    return res.data.data;
  },

  async getFocusSessions(date?: string): Promise<any> {
    const params = date ? { date } : {};
    const res = await apiClient.get<{ success: boolean; data: any }>(
      '/today/focus-sessions',
      { params }
    );
    return res.data.data;
  },
};
