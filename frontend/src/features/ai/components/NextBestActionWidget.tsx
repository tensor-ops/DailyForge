import React, { useState, useEffect } from 'react';
import { aiFoundationService } from '@/services/aiFoundationService';
import { NextBestAction } from '@/types/aiFoundation';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface NextBestActionWidgetProps {
  className?: string;
  onActionTriggered?: () => void;
}

export const NextBestActionWidget: React.FC<NextBestActionWidgetProps> = ({
  className,
  onActionTriggered,
}) => {
  const [actions, setActions] = useState<NextBestAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, info } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadActions = async () => {
      try {
        const res = await aiFoundationService.getNextBestActions();
        setActions(res.actions || []);
      } catch (err) {
        console.error('Failed to load next best actions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadActions();
  }, []);

  const handleActionClick = (action: NextBestAction) => {
    if (action.actionType === 'NAVIGATE_PLANNER') {
      navigate('/planner');
    } else if (action.actionType === 'COMPLETE_HABIT') {
      navigate('/today');
      info('Focus Routine', `Ready to log ${action.title}.`);
    } else if (action.actionType === 'OPEN_DAILY_REVIEW') {
      navigate('/today');
    } else {
      success('Action Initialized', action.title);
    }
    if (onActionTriggered) onActionTriggered();
  };

  if (isLoading || actions.length === 0) return null;

  const topAction = actions[0];

  const priorityColors = {
    CRITICAL: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    HIGH: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    MEDIUM: 'bg-primary/15 border-primary/30 text-primary',
    LOW: 'bg-muted border-border text-muted-foreground',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-3xl bg-gradient-to-r from-[#0C1527] via-[#091122] to-[#080E1D] border-2 border-primary/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs select-none',
        className
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="h-9 w-9 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0 mt-0.5">
          <Zap className="h-5 w-5 fill-primary" />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
              Next Best Action
            </span>
            <span
              className={cn(
                'text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider',
                priorityColors[topAction.priority]
              )}
            >
              {topAction.priority} Priority
            </span>
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{topAction.durationMinutes}m</span>
            </span>
          </div>

          <h4 className="text-sm font-extrabold text-foreground truncate">
            {topAction.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-snug">
            {topAction.reason} • <span className="text-emerald-400 font-semibold">{topAction.expectedValue}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => handleActionClick(topAction)}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-[0.98]"
        >
          <span>{topAction.actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
