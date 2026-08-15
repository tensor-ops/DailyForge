import { apiClient } from './api';
import { Task, CreateTaskInput } from '@/types/task';

export const taskService = {
  async getTasks(params?: { date?: string; status?: string }): Promise<Task[]> {
    const res = await apiClient.get<{ success: boolean; data: Task[] }>('/tasks', { params });
    return res.data.data;
  },

  async getTaskById(id: string): Promise<Task> {
    const res = await apiClient.get<{ success: boolean; data: Task }>(`/tasks/${id}`);
    return res.data.data;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const res = await apiClient.post<{ success: boolean; data: Task }>('/tasks', input);
    return res.data.data;
  },

  async updateTask(id: string, input: Partial<CreateTaskInput & { status: string; actualMinutes: number }>): Promise<Task> {
    const res = await apiClient.patch<{ success: boolean; data: Task }>(`/tasks/${id}`, input);
    return res.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};
