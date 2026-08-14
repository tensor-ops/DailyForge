export type InsightType =
  | 'pattern'
  | 'recommendation'
  | 'warning'
  | 'achievement'
  | 'prediction';

export interface AIInsight {
  id: string;
  type: InsightType;
  headline: string;
  explanation: string;
  confidence: number; // e.g. 0.85 -> 85%
  actionLabel?: string;
  actionPayload?: {
    type: string;
    habitId?: string;
    suggestedChange?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedPrompts?: string[];
  isStreaming?: boolean;
}
