import { apiClient } from './api';
import { Habit, CreateHabitInput, HabitFilterOptions } from '@/types/habit';

export const habitService = {
  async getHabits(options?: Partial<HabitFilterOptions>): Promise<Habit[]> {
    const params: Record<string, string | number> = {};
    if (options?.status) params.status = options.status;
    if (options?.category && options.category !== 'all') params.category = options.category;
    if (options?.searchQuery) params.searchQuery = options.searchQuery;
    if (options?.sortBy) params.sortBy = options.sortBy;
    if (options?.sortOrder) params.sortOrder = options.sortOrder;

    const res = await apiClient.get<{
      success: boolean;
      data: { habits: Habit[]; pagination: { total: number } };
    }>('/habits', { params });

    return res.data.data.habits;
  },

  async getHabitById(id: string): Promise<Habit> {
    const res = await apiClient.get<{ success: boolean; data: Habit }>(`/habits/${id}`);
    return res.data.data;
  },

  async createHabit(input: CreateHabitInput): Promise<Habit> {
    const res = await apiClient.post<{ success: boolean; data: Habit }>('/habits', input);
    return res.data.data;
  },

  async updateHabit(id: string, input: Partial<CreateHabitInput>): Promise<Habit> {
    const res = await apiClient.patch<{ success: boolean; data: Habit }>(`/habits/${id}`, input);
    return res.data.data;
  },

  async deleteHabit(id: string): Promise<void> {
    await apiClient.delete(`/habits/${id}`);
  },

  async completeHabit(habitId: string, date?: string, notes?: string): Promise<Habit> {
    const res = await apiClient.post<{ success: boolean; data: Habit }>(
      `/habits/${habitId}/complete`,
      { date, notes }
    );
    return res.data.data;
  },

  async uncompleteHabit(habitId: string, date?: string): Promise<Habit> {
    const endpoint = date
      ? `/habits/${habitId}/complete/${date}`
      : `/habits/${habitId}/complete`;
    const res = await apiClient.delete<{ success: boolean; data: Habit }>(endpoint);
    return res.data.data;
  },

  async toggleComplete(habit: Habit): Promise<Habit> {
    if (habit.completedToday) {
      return this.uncompleteHabit(habit.id);
    } else {
      return this.completeHabit(habit.id);
    }
  },
};
