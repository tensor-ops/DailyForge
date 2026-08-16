import { HabitCategory } from './habit';
import { ThemeName } from '@/components/brand/themeLogos';

export interface UserForgeIdentity {
  title: string;
  badge: string;
  level: number;
  experiencePoints: number;
  description: string;
}

export interface ProfilePerformance {
  forgeScore: number;
  forgeScoreChange: string;
  consistency: number;
  execution: number;
  reliability: number;
  recovery: number;
  momentum: {
    score: number;
    status: string;
    trend: number;
  };
}

export interface HabitCategoryMetric {
  category: HabitCategory | string;
  count: number;
  completionRate: number;
  averageStreak: number;
}

export interface HabitIdentityData {
  strongestArea: {
    category: string;
    rate: number;
  };
  mostConsistentHabit: {
    id: string;
    name: string;
    category: string;
    rate: number;
    streak: number;
  } | null;
  bestTimeWindow: {
    window: string;
    rate: number;
  };
  mostImprovedHabit: {
    name: string;
    delta: string;
  } | null;
  mostChallengingHabit: {
    id: string;
    name: string;
    category: string;
    rate: number;
  } | null;
  categoryBreakdown: HabitCategoryMetric[];
}

export interface ConsistencyDay {
  date: string;
  count: number;
  totalHabits: number;
  percentage: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface PersonalRecordItem {
  label: string;
  value: string;
  date: string;
}

export interface PersonalRecordsData {
  longestStreak: PersonalRecordItem;
  bestCompletionWeek: PersonalRecordItem;
  highestForgeScore: PersonalRecordItem;
  mostCompletedDay: PersonalRecordItem;
  totalCompletions: PersonalRecordItem;
  bestRecovery: PersonalRecordItem;
}

export interface ProfileAchievementItem {
  code: string;
  title: string;
  description: string;
  category: string;
  tier: string;
  rarity: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
}

export interface ProfileGoalItem {
  id: string;
  title: string;
  category: string;
  progress: number;
  targetDate: string;
  status: string;
}

export interface ProfilePlannerSummary {
  preferredFocusTime: string;
  averagePlannedFocus: string;
  averageCompletedFocus: string;
  planningReliability: number;
  totalSessions: number;
}

export interface ProfileAIProfile {
  primaryFocus: string;
  peakWindow: string;
  currentChallenge: string;
  preferredSessionLength: string;
  currentRecommendation: string;
  coachingStyle: string;
  learningState: string;
  coveragePercentage: number;
}

export interface ProfileUserData {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  membershipTier: 'free' | 'pro' | 'beta' | 'admin';
  timezone: string;
  language: string;
  memberSince: string;
  currentStreak: number;
  longestStreak: number;
  totalHabitsCount: number;
  overallCompletionRate: number;
  preferences?: {
    theme?: string;
    themeName?: ThemeName;
    accentTheme?: string;
    emailNotifications?: boolean;
    dailyReminderTime?: string;
    weekStartsOn?: 'monday' | 'sunday';
    aiCoachingStyle?: 'direct' | 'encouraging' | 'analytical' | 'balanced';
    preferredFocusTime?: string;
    focusAreas?: string[];
  };
}

export interface CompleteProfileResponse {
  user: ProfileUserData;
  identity: UserForgeIdentity;
  performance: ProfilePerformance;
  habitIdentity: HabitIdentityData;
  consistencyHistory: ConsistencyDay[];
  personalRecords: PersonalRecordsData;
  achievements: {
    unlocked: ProfileAchievementItem[];
    totalUnlocked: number;
    totalAvailable: number;
    recentMilestones: any[];
  };
  goalsSummary: {
    active: ProfileGoalItem[];
    totalCompleted: number;
    totalActive: number;
    averageProgress: number;
  };
  plannerSummary: ProfilePlannerSummary;
  aiProfile: ProfileAIProfile;
  preferences?: Record<string, any>;
}

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  timezone?: string;
  language?: string;
  preferences?: Record<string, any>;
}
