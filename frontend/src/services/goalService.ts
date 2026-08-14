import { apiClient } from './api';
import { Goal, CreateGoalInput, ParsedHabit, GoalPlan } from '@/types/goal';

export const goalService = {
  async getGoals(): Promise<Goal[]> {
    const res = await apiClient.get<{ success: boolean; data: { goals: Goal[] } }>('/goals');
    return res.data.data.goals;
  },

  async getGoal(id: string): Promise<Goal> {
    const res = await apiClient.get<{ success: boolean; data: Goal }>(`/goals/${id}`);
    return res.data.data;
  },

  async createGoal(input: CreateGoalInput): Promise<Goal> {
    const res = await apiClient.post<{ success: boolean; data: Goal }>('/goals', input);
    return res.data.data;
  },

  async updateGoal(id: string, input: Partial<CreateGoalInput & { status: string }>): Promise<Goal> {
    const res = await apiClient.patch<{ success: boolean; data: Goal }>(`/goals/${id}`, input);
    return res.data.data;
  },

  async deleteGoal(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`);
  },

  async parseNaturalHabit(text: string): Promise<ParsedHabit> {
    const res = await apiClient.post<{ success: boolean; data: ParsedHabit }>('/ai/habits/parse', { text });
    return res.data.data;
  },

  async planGoal(goalText: string): Promise<GoalPlan> {
    const res = await apiClient.post<{ success: boolean; data: GoalPlan }>('/ai/goals/plan', { goalText });
    return res.data.data;
  },
};
