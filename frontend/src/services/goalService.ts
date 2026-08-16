import { apiClient } from './api';
import {
  Goal,
  GoalsResponse,
  CreateGoalInput,
  UpdateGoalInput,
  GoalMilestone,
} from '@/types/goal';

export const goalService = {
  async getGoals(params?: {
    category?: string;
    priority?: string;
    status?: string;
    search?: string;
    archived?: boolean;
  }): Promise<GoalsResponse> {
    const res = await apiClient.get<{ success: boolean; data: GoalsResponse }>('/goals', {
      params,
    });
    return res.data.data;
  },

  async getGoal(id: string): Promise<Goal> {
    const res = await apiClient.get<{ success: boolean; data: Goal }>(`/goals/${id}`);
    return res.data.data;
  },

  async createGoal(data: CreateGoalInput): Promise<Goal> {
    const res = await apiClient.post<{ success: boolean; data: Goal }>('/goals', data);
    return res.data.data;
  },

  async updateGoal(id: string, data: UpdateGoalInput): Promise<Goal> {
    const res = await apiClient.patch<{ success: boolean; data: Goal }>(`/goals/${id}`, data);
    return res.data.data;
  },

  async deleteGoal(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`);
  },

  async archiveGoal(id: string): Promise<Goal> {
    const res = await apiClient.post<{ success: boolean; data: Goal }>(`/goals/${id}/archive`);
    return res.data.data;
  },

  async togglePauseGoal(id: string): Promise<Goal> {
    const res = await apiClient.post<{ success: boolean; data: Goal }>(`/goals/${id}/pause`);
    return res.data.data;
  },

  async duplicateGoal(id: string): Promise<Goal> {
    const res = await apiClient.post<{ success: boolean; data: Goal }>(`/goals/${id}/duplicate`);
    return res.data.data;
  },

  async addMilestone(
    goalId: string,
    milestone: { title: string; description?: string; weight?: number; dueDate?: string }
  ): Promise<Goal> {
    const res = await apiClient.post<{ success: boolean; data: Goal }>(
      `/goals/${goalId}/milestones`,
      milestone
    );
    return res.data.data;
  },

  async updateMilestone(
    goalId: string,
    milestoneId: string,
    data: Partial<GoalMilestone>
  ): Promise<Goal> {
    const res = await apiClient.patch<{ success: boolean; data: Goal }>(
      `/goals/${goalId}/milestones/${milestoneId}`,
      data
    );
    return res.data.data;
  },

  async deleteMilestone(goalId: string, milestoneId: string): Promise<Goal> {
    const res = await apiClient.delete<{ success: boolean; data: Goal }>(
      `/goals/${goalId}/milestones/${milestoneId}`
    );
    return res.data.data;
  },

  async linkHabit(goalId: string, habitId: string): Promise<Goal> {
    const res = await apiClient.post<{ success: boolean; data: Goal }>(`/goals/${goalId}/habits`, {
      habitId,
    });
    return res.data.data;
  },

  async unlinkHabit(goalId: string, habitId: string): Promise<Goal> {
    const res = await apiClient.delete<{ success: boolean; data: Goal }>(
      `/goals/${goalId}/habits/${habitId}`
    );
    return res.data.data;
  },

  async linkTask(goalId: string, taskId: string): Promise<Goal> {
    const res = await apiClient.post<{ success: boolean; data: Goal }>(`/goals/${goalId}/tasks`, {
      taskId,
    });
    return res.data.data;
  },

  async unlinkTask(goalId: string, taskId: string): Promise<Goal> {
    const res = await apiClient.delete<{ success: boolean; data: Goal }>(
      `/goals/${goalId}/tasks/${taskId}`
    );
    return res.data.data;
  },
};
