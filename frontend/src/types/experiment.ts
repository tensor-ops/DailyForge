export interface DailyObservation {
  dayNumber: number;
  date: string;
  scheduled: boolean;
  completed: boolean;
  adheredToIntervention: boolean;
  score: number;
  notes?: string;
}

export interface ExperimentItem {
  id: string;
  _id?: string;
  name: string;
  question: string;
  hypothesis: string;
  habitId: string | null;
  habitName: string;
  category: string;
  interventionType: string;
  interventionDetails: {
    originalTime?: string;
    experimentTime?: string;
    notes?: string;
  };
  status:
    | 'DRAFT'
    | 'BASELINE'
    | 'ACTIVE'
    | 'PAUSED'
    | 'COMPLETED'
    | 'SUCCESSFUL'
    | 'PARTIALLY_SUCCESSFUL'
    | 'INCONCLUSIVE'
    | 'NO_IMPROVEMENT'
    | 'NEGATIVE'
    | 'DISCARDED';
  startDate: string;
  endDate: string;
  durationDays: number;
  dayProgress: number;
  baselineMetric: string;
  baselineValue: number;
  targetValue: number;
  currentValue: number;
  finalValue?: number;
  improvementPts: number;
  interventionAdherence: number;
  isApplied: boolean;
  appliedAt?: string;
  verdict?: string;
  recommendation?: string;
  sideEffects?: {
    reliability?: string;
    friction?: string;
    avgDuration?: string;
  };
  dailyObservations?: DailyObservation[];
}

export interface ExperimentTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  defaultDuration: number;
  defaultTargetImprovement: number;
  icon: string;
}

export interface ExperimentDetailResponse {
  experiment: ExperimentItem;
  comparisonData: Array<{
    day: string;
    baseline: number;
    intervention: number | null;
    target: number;
  }>;
  dailyObservations: DailyObservation[];
  adherence: number;
  verdict: {
    status: string;
    badge: string;
    summary: string;
    recommendation: string;
  };
}

export interface ForgeLabOverviewResponse {
  heroMetrics: {
    activeExperiments: number;
    completedExperiments: number;
    successfulExperiments: number;
    averageImprovement: string;
    experimentsThisMonth: number;
  };
  suggestedExperiment: {
    title: string;
    habitName: string;
    question: string;
    hypothesis: string;
    evidence: string;
    category: string;
    suggestedTime: string;
  };
  activeExperiments: ExperimentItem[];
  allExperiments: ExperimentItem[];
  templates: ExperimentTemplate[];
  impactData: Array<{
    experiment: string;
    improvement: number;
    adherence: number;
    status: string;
  }>;
  history: ExperimentItem[];
}
