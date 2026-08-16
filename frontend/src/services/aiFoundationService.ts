import { apiClient } from './api';
import {
  AIStatusResponse,
  BehavioralSignal,
  AIMemoryItem,
  AIUsageResponse,
} from '@/types/aiFoundation';

export const aiFoundationService = {
  async getStatus(): Promise<AIStatusResponse> {
    const res = await apiClient.get<{ success: boolean; data: AIStatusResponse }>('/ai/status');
    return res.data.data;
  },

  async getContext(): Promise<any> {
    const res = await apiClient.get<{ success: boolean; data: any }>('/ai/context');
    return res.data.data;
  },

  async refreshContext(): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/ai/context/refresh');
    return res.data.data;
  },

  async getSignals(): Promise<{ signals: BehavioralSignal[]; count: number }> {
    const res = await apiClient.get<{ success: boolean; data: { signals: BehavioralSignal[]; count: number } }>('/ai/signals');
    return res.data.data;
  },

  async getMemories(type?: 'FACT' | 'ANALYTIC' | 'EPISODIC'): Promise<{ memories: AIMemoryItem[]; count: number }> {
    const params = type ? { type } : {};
    const res = await apiClient.get<{ success: boolean; data: { memories: AIMemoryItem[]; count: number } }>('/ai/memory', { params });
    return res.data.data;
  },

  async saveMemory(data: { type: string; key: string; value: any; source?: string }): Promise<AIMemoryItem> {
    const res = await apiClient.post<{ success: boolean; data: AIMemoryItem }>('/ai/memory', data);
    return res.data.data;
  },

  async deleteMemory(id: string): Promise<void> {
    await apiClient.delete(`/ai/memory/${id}`);
  },

  async getUsage(): Promise<AIUsageResponse> {
    const res = await apiClient.get<{ success: boolean; data: AIUsageResponse }>('/ai/usage');
    return res.data.data;
  },

  async searchKnowledge(query: string, category?: string): Promise<any[]> {
    const params = { query, category };
    const res = await apiClient.get<{ success: boolean; data: { results: any[] } }>('/ai/rag/search', { params });
    return res.data.data.results;
  },
};
