import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { analyticsService } from '@/services/analyticsService';
import { HabitIntelligenceSnapshot } from '@/types/habitIntelligence';
import {
  Flame,
  Clock,
  Calendar,
  AlertTriangle,
  Target,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface HabitDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitId: string | null;
}

export const HabitDrilldownModal: React.FC<HabitDrilldownModalProps> = ({
  isOpen,
  onClose,
  habitId,
}) => {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<HabitIntelligenceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && habitId) {
      setLoading(true);
      analyticsService
        .getHabitSnapshot(habitId)
        .then((data) => setSnapshot(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, habitId]);

  if (!habitId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={snapshot?.name || 'Habit Intelligence Snapshot'}
      description={`${snapshot?.category || 'Habit'} · Behavioral Diagnosis`}
      size="md"
    >
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
          Analyzing habit signals, friction, and optimal rhythms...
        </div>
      ) : !snapshot ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          Could not load habit snapshot.
        </div>
      ) : (
        <div className="space-y-4 text-left pt-1">
          {/* Top Score Matrix */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-surface-sunken border border-border/80 text-center">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                Consistency
              </span>
              <span className="text-xl font-extrabold text-foreground block mt-0.5">
                {snapshot.consistencyScore}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-sunken border border-border/80 text-center">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                Reliability
              </span>
              <span className="text-xl font-extrabold text-primary block mt-0.5">
                {snapshot.reliabilityScore}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-sunken border border-border/80 text-center">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                Friction
              </span>
              <span
                className={cn(
                  'text-xl font-extrabold block mt-0.5',
                  snapshot.frictionScore > 50
                    ? 'text-danger'
                    : snapshot.frictionScore > 25
                    ? 'text-warning'
                    : 'text-success'
                )}
              >
                {snapshot.frictionScore}%
              </span>
            </div>
          </div>

          {/* Streaks Row */}
          <div className="p-3 rounded-xl bg-surface-elevated border border-border/70 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-warning fill-warning" />
              <span className="text-foreground">Current Streak: <strong className="text-warning">{snapshot.currentStreak} days</strong></span>
            </div>
            <span className="text-muted-foreground text-[11px]">
              Longest: <strong className="text-foreground">{snapshot.longestStreak} days</strong>
            </span>
          </div>

          {/* Contextual Rhythms & Risk */}
          <div className="space-y-2 text-xs font-semibold">
            <div className="p-3 rounded-xl bg-surface-elevated border border-border/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">Best Window:</span>
              </div>
              <span className="text-foreground font-bold">{snapshot.preferredWindow}</span>
            </div>

            <div className="p-3 rounded-xl bg-surface-elevated border border-border/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-muted-foreground">Strongest Day:</span>
              </div>
              <span className="text-foreground font-bold">{snapshot.bestDay}</span>
            </div>

            <div className="p-3 rounded-xl bg-surface-elevated border border-border/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="text-muted-foreground">Primary Risk:</span>
              </div>
              <span className="text-amber-400 font-bold">{snapshot.primaryRisk}</span>
            </div>
          </div>

          {/* Goal Link */}
          <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 space-y-1">
            <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>Connected Goal</span>
            </span>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-foreground">{snapshot.goalTitle}</span>
              <span className="text-success font-mono">{snapshot.expectedContribution}</span>
            </div>
          </div>

          {/* Footer Action Links */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
            <button
              onClick={() => {
                onClose();
                navigate(`/habits/${snapshot.habitId}`);
              }}
              className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-muted border border-border text-foreground text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Open Habit</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/planner');
              }}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <span>Open in Planner</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
