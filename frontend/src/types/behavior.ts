export interface BehaviorAnalytics {
  isBaselineBuilding: boolean;
  baselineProgress: {
    completionsCount: number;
    completionsTarget: number;
    daysObserved: number;
    daysTarget: number;
    insightsAvailable: number;
  };
  forgeScore: number;
  consistencyIndex: number;
  consistencyChange: number;
  momentum: {
    score: number;
    trend: number;
    status: 'BUILDING' | 'STABLE' | 'SLOWING' | 'DECLINING' | 'RECOVERING';
  };
  executionRate: {
    completed: number;
    expected: number;
    rate: number;
  };
  habitReliability: Array<{
    habitId: string;
    name: string;
    category: string;
    reliability: number;
    streak: number;
  }>;
  habitFriction: Array<{
    habitId: string;
    name: string;
    frictionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    completionRate: number;
    topMissReason: string;
    reasonsBreakdown: Record<string, number>;
  }>;
  habitRisk: Array<{
    habitId: string;
    name: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    trend: number;
    currentRate: number;
    baselineRate: number;
  }>;
  recoveryRate: {
    rate: number;
    averageGapDays: number;
    recoveryLogsCount: number;
  };
  goalVelocity: Array<{
    goalId: string;
    name: string;
    progress: number;
    expectedProgress: number;
    velocity: number;
    status: 'Ahead' | 'On Track' | 'At Risk' | 'Behind';
  }>;
  focusCapacity: {
    score: number;
    energy: number;
    focus: number;
    capacityHours: number;
  };
  peakWindows: Array<{
    window: string;
    percentage: number;
    count: number;
  }>;
  habitRelationships: Array<{
    habitA: string;
    habitB: string;
    correlation: number;
    description: string;
  }>;
  keystoneHabits: Array<{
    habitId: string;
    name: string;
    impactScore: number;
    activeRate: number;
    missedRate: number;
  }>;
  weeklyReview: {
    wins: string[];
    challenges: string[];
    recommendations: Array<{
      type: string;
      habitId?: string;
      name?: string;
      text: string;
    }>;
  };
  fingerprint: {
    consistencyIndex: number;
    recoveryRate: number;
    goalVelocity: number;
    morningConsistency: number;
    eveningConsistency: number;
    focusFactor: number;
    peakPerformanceHours: string;
  };
}

export interface EnergyLog {
  id?: string;
  date: string;
  energy: number;
  focus: number;
  mood?: string;
}

export interface Experiment {
  id?: string;
  name: string;
  hypothesis: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  baselineMetric: string;
  targetValue: number;
  currentValue: number;
  status: 'active' | 'completed' | 'discarded';
  result?: string;
}
