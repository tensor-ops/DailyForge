import { apiClient } from './api';
import {
  MilestonesOverviewResponse,
  AchievementItem,
  MomentItem,
} from '@/types/milestone';

export const milestoneService = {
  async getOverview(): Promise<MilestonesOverviewResponse> {
    const res = await apiClient.get<{ success: boolean; data: MilestonesOverviewResponse }>(
      '/milestones/overview'
    );
    return res.data.data;
  },

  async getAchievements(): Promise<{
    allAchievements: AchievementItem[];
    unlocked: AchievementItem[];
    locked: AchievementItem[];
  }> {
    const res = await apiClient.get<{
      success: boolean;
      data: {
        allAchievements: AchievementItem[];
        unlocked: AchievementItem[];
        locked: AchievementItem[];
      };
    }>('/milestones/achievements');
    return res.data.data;
  },

  async getMoments(): Promise<MomentItem[]> {
    const res = await apiClient.get<{ success: boolean; data: MomentItem[] }>(
      '/milestones/moments'
    );
    return res.data.data;
  },

  async togglePinMoment(code: string): Promise<{ achievementCode: string; isPinned: boolean }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { achievementCode: string; isPinned: boolean };
    }>(`/milestones/moments/${code}/pin`);
    return res.data.data;
  },
};
