export interface PersonalizationCoverage {
  percentage: number;
  state: 'LEARNING' | 'EMERGING' | 'READY';
  dataPoints: {
    habits: number;
    completions: number;
    goals: number;
    plannerEvents: number;
    experiments: number;
    memories: number;
    signals: number;
  };
}

export interface AIStatusResponse {
  provider: string;
  isConfigured: boolean;
  models: {
    fast: string;
    reasoning: string;
    embedding: string;
  };
  features: {
    enabled: boolean;
    insights: boolean;
    coach: boolean;
    recommendations: boolean;
    experiments: boolean;
    rag: boolean;
  };
  personalizationCoverage: PersonalizationCoverage;
  activeSignalsCount: number;
  activeMemoriesCount: number;
}

export interface BehavioralSignal {
  type: string;
  value: string;
  evidence: string;
  observationCount: number;
  confidence: number;
  createdAt: string;
}

export interface InsightEvidence {
  metric?: string;
  headline?: string;
  baseline?: string;
  observed?: string;
  difference?: string;
  sampleCount?: number;
  timeRange?: string;
  breakdown?: Array<{
    label: string;
    value: string;
    rate: number;
  }>;
}

export interface InsightItem {
  id: string;
  _id?: string;
  type: 'PATTERN' | 'RECOMMENDATION' | 'WARNING' | 'OPPORTUNITY' | 'CELEBRATION' | 'EXPERIMENT' | 'GOAL' | 'RECOVERY' | 'PLANNING';
  category: 'CIRCADIAN' | 'FRICTION' | 'MOMENTUM' | 'RECOVERY' | 'CONSISTENCY' | 'GOAL_ALIGNMENT' | 'EXPERIMENTATION';
  title: string;
  summary: string;
  isTopInsight: boolean;
  confidence: 'INSUFFICIENT_DATA' | 'EMERGING_SIGNAL' | 'MODERATE_SIGNAL' | 'STRONG_SIGNAL' | 'EXPERIMENT_SUPPORTED';
  evidence?: InsightEvidence;
  actionLabel?: string;
  actionType?: 'VIEW_EVIDENCE' | 'TRY_IN_PLANNER' | 'START_EXPERIMENT' | 'ADJUST_HABIT' | 'REVIEW_GOAL' | 'NONE';
  actionPayload?: any;
  feedback?: {
    rating: 'HELPFUL' | 'NOT_HELPFUL' | null;
    comment: string;
  };
  createdAt: string;
}

export interface RecommendationItem {
  id: string;
  _id?: string;
  title: string;
  reason: string;
  evidence?: {
    metric: string;
    baseline: string;
    observed: string;
    difference: string;
    sampleCount: number;
    timeRange: string;
  };
  confidence: 'INSUFFICIENT_DATA' | 'EMERGING_SIGNAL' | 'MODERATE_SIGNAL' | 'STRONG_SIGNAL' | 'EXPERIMENT_SUPPORTED';
  expectedImpact: 'LOW' | 'MODERATE' | 'HIGH' | 'TRANSFORMATIVE';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  rankingScore: number;
  actionType: string;
  actionPayload: any;
  status: 'ACTIVE' | 'APPLIED' | 'DISMISSED';
  feedback?: {
    rating: 'HELPFUL' | 'NOT_HELPFUL' | null;
    reason: string | null;
    comment: string;
  };
  createdAt: string;
}

export interface DailyBriefData {
  date: string;
  headline: string;
  todayPriority: string;
  habitProtection: string;
  goalAction: string;
  riskWarning: string;
  recommendedAction: string;
  celebrationNote: string;
}

export interface WeeklyReviewData {
  timeframe: string;
  consistencyRate: string;
  executionScore: number;
  reliabilityScore: number;
  growthTrajectory: string;
  momentumTier: string;
  bestHabit: string;
  weakestHabit: string;
  longestStreak: string;
  achievementsUnlocked: number;
  experimentsActive: number;
  mainLesson: string;
  nextWeekFocus: string;
  summary: string;
}

export interface MonthlyReviewData {
  timeframe: string;
  longTermGrowth: string;
  habitEvolution: string;
  goalProgress: string;
  personalRecords: string;
  behaviorPatterns: string;
  recommendedFocus: string;
}

export interface ProposedAction {
  actionType: string;
  title: string;
  currentValue: string;
  proposedValue: string;
  impactDescription: string;
  payload: any;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | null;
}

export interface ChatMessage {
  id: string;
  _id?: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  agentType?: 'HABIT_COACH' | 'PLANNER_OPTIMIZER' | 'GOAL_STRATEGIST' | 'MOMENTUM_ANALYST' | 'RECOVERY_COACH' | 'PROGRESS_NARRATOR' | 'EXPERIMENT_SCIENTIST' | 'GENERAL_COACH';
  intent?: string;
  evidence?: any;
  suggestedQuickReplies?: string[];
  proposedAction?: ProposedAction;
  createdAt: string;
}

// Phase 3 Types
export interface NextBestAction {
  id: string;
  title: string;
  reason: string;
  durationMinutes: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  expectedValue: string;
  actionLabel: string;
  actionType: string;
  entityId?: string;
}

export interface HabitRiskItem {
  habitId: string;
  name: string;
  category: string;
  currentStreak: number;
  recent7DayRate: string;
  frictionLevel: string;
  riskLevel: 'AT_RISK' | 'WATCH' | 'STABLE';
  reason: string;
  suggestedMitigation: string;
}

export interface HabitRiskMap {
  atRisk: HabitRiskItem[];
  watch: HabitRiskItem[];
  stable: HabitRiskItem[];
}

export interface CoachingProfile {
  preferredExecutionWindows: Array<{
    window: string;
    reliabilityRate: number;
    isPeak: boolean;
  }>;
  highFrictionPeriods: Array<{
    period: string;
    reason: string;
  }>;
  strongWeekdays: string[];
  weakWeekdays: string[];
  preferredSessionLengthMinutes: number;
  recoveryVelocityHours: number;
  successfulExperimentPatterns: string[];
}

export interface ReflectionPrompt {
  id: string;
  category: string;
  prompt: string;
}
