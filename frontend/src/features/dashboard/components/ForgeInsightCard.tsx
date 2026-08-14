import React from 'react';
import { AIInsight } from '@/types/ai';
import { ArrowUpRight } from 'lucide-react';

interface ForgeInsightCardProps {
  insight: AIInsight | null;
  isLoading?: boolean;
}

export const ForgeInsightCard: React.FC<ForgeInsightCardProps> = ({ insight, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="space-y-2 animate-pulse">
          <div className="h-3 w-24 bg-muted/50 rounded" />
          <div className="h-4 w-full bg-muted/50 rounded" />
          <div className="h-3 w-3/4 bg-muted/30 rounded" />
        </div>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="bg-card border border-ai/20 rounded-2xl p-5 flex gap-4 group hover:border-ai/40 transition-colors duration-200">
      {/* AI Indicator */}
      <div className="shrink-0 mt-0.5">
        <div className="h-8 w-8 rounded-xl bg-ai/15 flex items-center justify-center">
          <span className="text-ai text-sm">✦</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ai">
            Forge Insight
          </span>
          <span className="text-[10px] text-muted-foreground">
            {Math.round(insight.confidence * 100)}% confidence
          </span>
        </div>
        <h4 className="text-sm font-semibold text-foreground leading-snug">{insight.headline}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{insight.explanation}</p>

        {insight.actionLabel && (
          <button className="mt-1 flex items-center gap-1 text-xs font-semibold text-ai hover:text-ai/80 transition-colors">
            {insight.actionLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
