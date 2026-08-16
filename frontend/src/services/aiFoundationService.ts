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
  NextBestAction,
  HabitRiskMap,
  CoachingProfile,
  ReflectionPrompt,
} from '@/types/aiFoundation';

export const aiFoundationService = {
  // Phase 1
  async getStatus(): Promise<AIStatusResponse> {
    const res = await apiClient.get<{ success: boolean; data: AIStatusResponse }>('/ai/status');
    return res.data.data;
  },

  async getSignals(): Promise<{ signals: BehavioralSignal[]; count: number }> {
    const res = await apiClient.get<{ success: boolean; data: { signals: BehavioralSignal[]; count: number } }>('/ai/signals');
    return res.data.data;
  },

  // Phase 2
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

  // Phase 3: Next Best Action, Risk Map, Profile, Experiments, Reflections & Rollback
  async getNextBestActions(): Promise<{ actions: NextBestAction[]; count: number }> {
    const res = await apiClient.get<{
      success: boolean;
      data: { actions: NextBestAction[]; count: number };
    }>('/ai/next-best-action');
    return res.data.data;
  },

  async getHabitRiskMap(): Promise<HabitRiskMap> {
    const res = await apiClient.get<{ success: boolean; data: HabitRiskMap }>('/ai/risk-map');
    return res.data.data;
  },

  async getCoachingProfile(): Promise<CoachingProfile> {
    const res = await apiClient.get<{ success: boolean; data: CoachingProfile }>('/ai/coaching-profile');
    return res.data.data;
  },

  async generateExperiment(habitId?: string): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/ai/experiments/generate', { habitId });
    return res.data.data;
  },

  async evaluateExperiment(experimentId: string): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>(`/ai/experiments/evaluate/${experimentId}`);
    return res.data.data;
  },

  async getReflectionPrompts(): Promise<{ prompts: ReflectionPrompt[] }> {
    const res = await apiClient.get<{ success: boolean; data: { prompts: ReflectionPrompt[] } }>('/ai/reflections/prompts');
    return res.data.data;
  },

  async submitReflection(data: { promptId: string; question: string; responseText: string }): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/ai/reflections/submit', data);
    return res.data.data;
  },

  async rollbackTransaction(transactionId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; data: { success: boolean; message: string } }>(
      `/ai/transactions/rollback/${transactionId}`
    );
    return res.data.data;
  },
};
