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

export interface AIMemoryItem {
  id: string;
  type: 'FACT' | 'ANALYTIC' | 'EPISODIC';
  key: string;
  value: any;
  confidence: number;
  source: string;
  tags?: string[];
  createdAt: string;
}

export interface AIUsageResponse {
  totalRequests: number;
  totalTokens: number;
  totalEstimatedCostUsd: number;
  averageLatencyMs: number;
  recentRequests: Array<{
    id: string;
    requestType: string;
    model: string;
    tokens: number;
    latencyMs: number;
    status: string;
    createdAt: string;
  }>;
}
