export interface AchievementItem {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'STREAK' | 'CONSISTENCY' | 'EXECUTION' | 'LEARNING' | 'HEALTH' | 'GOALS' | 'RECOVERY' | 'PERFORMANCE';
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  icon: string;
  threshold: number;
  currentValue: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  isPinned: boolean;
  relatedHabitTitle?: string;
  relatedGoalTitle?: string;
}

export interface PersonalRecordItem {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  accent: 'orange' | 'blue' | 'green' | 'cyan';
  previousBest: string;
  achievedAt: string;
}

export interface MilestoneHeatmapItem {
  date: string;
  count: number;
  intensity: number; // 0 - 4
  completionRate: number;
  focusMinutes: number;
}

export interface MomentItem {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  tier: string;
  icon: string;
  unlockedAt: string | null;
  isPinned: boolean;
  relatedHabitTitle?: string;
  relatedGoalTitle?: string;
}

export interface AchievementTimelineItem {
  date: string;
  title: string;
  description: string;
  type: string;
  rarity: string;
  icon: string;
}

export interface MilestonesOverviewResponse {
  heroStats: {
    currentStreak: string;
    longestStreak: string;
    achievementsUnlocked: number;
    totalAchievements: number;
    personalRecords: number;
    forgeScore: number;
  };
  personalRecords: PersonalRecordItem[];
  heatmap: MilestoneHeatmapItem[];
  allAchievements: AchievementItem[];
  unlockedAchievements: AchievementItem[];
  lockedAchievements: AchievementItem[];
  youAreClose: AchievementItem[];
  nextMilestones: AchievementItem[];
  moments: MomentItem[];
  timeline: AchievementTimelineItem[];
}
