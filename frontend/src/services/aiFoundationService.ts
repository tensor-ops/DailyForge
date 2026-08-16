import { apiClient } from './api';
import {
  AIStatusResponse,
  BehavioralSignal,
  InsightItem,
  RecommendationItem,
  DailyBriefData,
  WeeklyReviewData,
  MonthlyReviewData,
  ChatMessage,
} from '@/types/aiFoundation';

export const aiFoundationService = {
  async getStatus(): Promise<AIStatusResponse> {
    const res = await apiClient.get<{ success: boolean; data: AIStatusResponse }>('/ai/status');
    return res.data.data;
  },

  async getSignals(): Promise<{ signals: BehavioralSignal[]; count: number }> {
    const res = await apiClient.get<{ success: boolean; data: { signals: BehavioralSignal[]; count: number } }>('/ai/signals');
    return res.data.data;
  },

  async getInsightFeed(): Promise<{
    topInsight: InsightItem | null;
    feed: InsightItem[];
    personalizationCoverage: any;
    lastAnalyzedAt: string;
  }> {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        topInsight: InsightItem | null;
        feed: InsightItem[];
        personalizationCoverage: any;
        lastAnalyzedAt: string;
      };
    }>('/ai/insights/feed');
    return res.data.data;
  },

  async submitInsightFeedback(
    insightId: string,
    rating: 'HELPFUL' | 'NOT_HELPFUL',
    comment?: string
  ): Promise<void> {
    await apiClient.post(`/ai/insights/${insightId}/feedback`, { rating, comment });
  },

  async getRankedRecommendations(): Promise<{
    recommendations: RecommendationItem[];
    count: number;
  }> {
    const res = await apiClient.get<{
      success: boolean;
      data: { recommendations: RecommendationItem[]; count: number };
    }>('/ai/recommendations/ranked');
    return res.data.data;
  },

  async handleRecommendationAction(
    recommendationId: string,
    action: 'APPLY' | 'DISMISS'
  ): Promise<void> {
    await apiClient.post(`/ai/recommendations/${recommendationId}/action`, { action });
  },

  async submitRecommendationFeedback(
    recommendationId: string,
    rating: 'HELPFUL' | 'NOT_HELPFUL',
    reason?: string | null
  ): Promise<void> {
    await apiClient.post(`/ai/recommendations/${recommendationId}/feedback`, { rating, reason });
  },

  async getDailyBrief(): Promise<DailyBriefData> {
    const res = await apiClient.get<{ success: boolean; data: DailyBriefData }>('/ai/brief/daily');
    return res.data.data;
  },

  async getWeeklyReview(): Promise<WeeklyReviewData> {
    const res = await apiClient.get<{ success: boolean; data: WeeklyReviewData }>('/ai/review/weekly');
    return res.data.data;
  },

  async getMonthlyReview(): Promise<MonthlyReviewData> {
    const res = await apiClient.get<{ success: boolean; data: MonthlyReviewData }>('/ai/review/monthly');
    return res.data.data;
  },

  async sendChatMessage(
    message: string,
    conversationId?: string
  ): Promise<{ conversationId: string; message: ChatMessage }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { conversationId: string; message: ChatMessage };
    }>('/ai/chat', { message, conversationId });
    return res.data.data;
  },

  async getChatHistory(conversationId?: string): Promise<{
    conversations: any[];
    activeConversationId: string;
    messages: ChatMessage[];
  }> {
    const params = conversationId ? { conversationId } : {};
    const res = await apiClient.get<{
      success: boolean;
      data: { conversations: any[]; activeConversationId: string; messages: ChatMessage[] };
    }>('/ai/chat/history', { params });
    return res.data.data;
  },

  async confirmAction(messageId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { success: boolean; message: string };
    }>('/ai/actions/confirm', { messageId });
    return res.data.data;
  },
};
