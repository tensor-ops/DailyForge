import { apiClient } from './api';
import { AIInsight, AIChatMessage } from '@/types/ai';

export const aiService = {
  async getInsights(): Promise<AIInsight[]> {
    const res = await apiClient.get<{ success: boolean; data: AIInsight[] }>('/ai/insights');
    return res.data.data;
  },

  async generateFreshInsights(): Promise<AIInsight[]> {
    const res = await apiClient.post<{ success: boolean; data: AIInsight[] }>(
      '/ai/insights/generate'
    );
    return res.data.data;
  },

  async getRecommendations() {
    const res = await apiClient.get('/ai/recommendations');
    return res.data.data;
  },

  async sendMessage(message: string, _history?: AIChatMessage[]): Promise<AIChatMessage> {
    const res = await apiClient.post<{
      success: boolean;
      data: { conversationId: string; message: AIChatMessage };
    }>('/ai/chat', { message });

    return res.data.data.message;
  },

  async getConversations(): Promise<AIChatMessage[]> {
    const res = await apiClient.get<{ success: boolean; data: AIChatMessage[] }>(
      '/ai/conversations'
    );
    return res.data.data;
  },
};
