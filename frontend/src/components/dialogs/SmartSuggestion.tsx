import React from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SmartSuggestionProps {
  title?: string;
  suggestion: string;
  reason?: string;
  onApply?: () => void;
  applied?: boolean;
  applyLabel?: string;
  badge?: string;
  className?: string;
}

export const SmartSuggestion: React.FC<SmartSuggestionProps> = ({
  title = 'DailyForge AI Suggestion',
  suggestion,
  reason,
  onApply,
  applied = false,
  applyLabel = 'Apply Suggestion',
  badge = 'Recommended',
  className,
}) => {
  return (
    <div
      className={cn(
        'p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/25 space-y-2 text-left transition-all',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-primary font-bold text-[11px] uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{title}</span>
        </div>
        {badge && (
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase">
            {badge}
          </span>
        )}
      </div>

      <p className="text-xs font-bold text-foreground leading-snug">
        {suggestion}
      </p>

      {reason && (
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          💡 <strong>Why:</strong> {reason}
        </p>
      )}

      {onApply && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onApply}
            disabled={applied}
            className={cn(
              'px-3 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer select-none',
              applied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-primary hover:bg-primary-hover text-white shadow-sm'
            )}
          >
            {applied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Applied ✓</span>
              </>
            ) : (
              <>
                <span>{applyLabel}</span>
                <ArrowRight className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
