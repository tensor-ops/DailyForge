import React from 'react';
import { PersonalizationCoverage } from '@/types/aiFoundation';
import { Brain } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PersonalizationCoverageBadgeProps {
  coverage: PersonalizationCoverage | null;
  className?: string;
}

export const PersonalizationCoverageBadge: React.FC<PersonalizationCoverageBadgeProps> = ({
  coverage,
  className,
}) => {
  if (!coverage) return null;

  const stateColors = {
    LEARNING: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    EMERGING: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    READY: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  };

  const stateLabels = {
    LEARNING: 'Learning Rhythm',
    EMERGING: 'Emerging Model',
    READY: 'High Evidence',
  };

  return (
    <div
      className={cn(
        'p-3.5 rounded-2xl bg-surface-sunken border border-border/80 text-xs flex items-center justify-between gap-3',
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
          <Brain className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-foreground text-xs">
              Personalization Coverage
            </span>
            <span
              className={cn(
                'text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider',
                stateColors[coverage.state]
              )}
            >
              {stateLabels[coverage.state]}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Based on {coverage.dataPoints.completions} logs, {coverage.dataPoints.habits} habits & {coverage.dataPoints.signals} behavioral signals.
          </p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className="text-sm font-mono font-extrabold text-foreground block">
          {coverage.percentage}%
        </span>
        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${coverage.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
