export interface ForgeScoreBreakdown {
  score: number;
  consistency: number;
  execution: number;
  reliability: number;
  recovery: number;
  momentum: number;
  weights: {
    consistency: string;
    execution: string;
    reliability: string;
    momentum: string;
    recovery: string;
  };
  formula: string;
}

export interface TrendPoint {
  date: string;
  label: string;
  completion: number;
  consistency: number;
  execution: number;
  reliability: number;
}

export interface HabitReliabilityItem {
  id: string;
  name: string;
  category: string;
  color: string;
  reliability: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  frictionScore: number;
  frictionLevel: 'Low' | 'Medium' | 'High';
  risk: 'Stable' | 'Watch' | 'At Risk';
  preferredTime: string;
  goalTitle: string;
}

export interface TimeOfDayItem {
  window: string;
  hours: string;
  successRate: number;
  completions: number;
}

export interface PeakWindowItem {
  activity: string;
  window: string;
  successRate: number;
  category: string;
}

export interface CategoryPerformanceItem {
  category: string;
  habitCount: number;
  reliability: number;
  trend: string;
}

export interface WeeklyPatternItem {
  day: string;
  dayName: string;
  successRate: number;
}

export interface AnalyticsOverviewResponse {
  timeRange: string;
  isBaselineBuilding: boolean;
  metrics: {
    consistency: { rate: number; changePts: number };
    execution: { rate: number; changePts: number };
    reliability: { rate: number; changePts: number };
    forgeScore: { value: number; changePts: number };
  };
  forgeScoreBreakdown: ForgeScoreBreakdown;
  trendPoints: TrendPoint[];
  habitReliability: HabitReliabilityItem[];
  timeOfDayAnalysis: TimeOfDayItem[];
  peakWindows: PeakWindowItem[];
  categoryPerformance: CategoryPerformanceItem[];
  weeklyPattern: WeeklyPatternItem[];
  strongestDay: { name: string; rate: number };
  weakestDay: { name: string; rate: number };
  habitRiskMap: {
    stable: HabitReliabilityItem[];
    watch: HabitReliabilityItem[];
    atRisk: HabitReliabilityItem[];
  };
  actionableInsight: {
    title: string;
    description: string;
    suggestedAction: string;
    targetCategory: string;
  };
}

export interface GrowthOverviewResponse {
  timeRange: string;
  heroMetrics: {
    thirtyDayGrowth: string;
    ninetyDayGrowth: string;
    consistencyGrowth: string;
    executionGrowth: string;
  };
  baseline: {
    establishedDate: string;
    initialConsistency: number;
    currentConsistency: number;
    improvementPts: number;
    status: string;
  };
  growthTrend: Array<{
    name: string;
    consistency: number;
    execution: number;
    reliability: number;
    recovery: number;
    baseline: number;
  }>;
  beforeVsNow: Array<{
    metric: string;
    before: string;
    now: string;
    change: string;
  }>;
  personalRecords: Array<{
    title: string;
    value: string;
    subtitle: string;
    icon: string;
  }>;
  habitMaturity: Array<{
    id: string;
    name: string;
    stage: 'NEW' | 'BUILDING' | 'ESTABLISHED' | 'AUTOMATED';
    label: string;
    ageDays: number;
    progress: number;
    color: string;
  }>;
  habitGrowthTable: Array<{
    id: string;
    name: string;
    category: string;
    startRate: string;
    nowRate: string;
    change: string;
  }>;
  compoundingProgression: Array<{
    week: string;
    rate: number;
    text: string;
  }>;
}

export interface MomentumOverviewResponse {
  timeRange: string;
  hero: {
    score: number;
    status: 'SURGING' | 'BUILDING' | 'STABLE' | 'COOLING' | 'DECLINING' | 'RECOVERING';
    trend: string;
    explanation: string;
  };
  trajectory: Array<{
    name: string;
    momentum: number;
    change: string;
    execution: number;
    consistency: number;
  }>;
  positiveDrivers: Array<{
    item: string;
    delta: string;
    reason: string;
  }>;
  slowingFactors: Array<{
    item: string;
    delta: string;
    reason: string;
  }>;
  streakHealth: {
    currentStreak: number;
    longestStreak: number;
    stabilityScore: number;
    recentBreaks: number;
    recoverySpeedDays: number;
  };
  recovery: {
    averageRecoveryDays: number;
    recoveryRate: string;
    fastestRecoveryDays: number;
    longestRecoveryDays: number;
    explanation: string;
  };
  atRiskHabits: Array<{
    id: string;
    name: string;
    reliability: string;
    trend: string;
    cause: string;
    recommendation: string;
  }>;
  actionPlan: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface HabitIntelligenceSnapshot {
  habitId: string;
  name: string;
  category: string;
  consistencyScore: number;
  reliabilityScore: number;
  frictionScore: number;
  currentStreak: number;
  longestStreak: number;
  preferredWindow: string;
  bestDay: string;
  primaryRisk: string;
  goalTitle: string;
  expectedContribution: string;
}
