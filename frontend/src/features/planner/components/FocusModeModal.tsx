import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { plannerService } from '@/services/plannerService';
import { CalendarEvent } from '@/types/planner';
import { Play, Pause, RotateCcw, Check, Target } from 'lucide-react';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onSuccess?: () => void;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  isOpen,
  onClose,
  event,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const initialSeconds = (event?.durationMinutes || 30) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (isOpen && event) {
      setSecondsRemaining((event.durationMinutes || 30) * 60);
      setIsRunning(true);
    }
  }, [isOpen, event]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  if (!event) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;

  const handleComplete = async () => {
    try {
      await plannerService.completeEvent(event.id);
      success('Focus session logged! ⚡', `+${event.durationMinutes} min focus time recorded.`);
      window.dispatchEvent(new Event('planner-updated'));
      window.dispatchEvent(new Event('habits-updated'));
      onSuccess?.();
      onClose();
    } catch {
      error('Complete failed', 'Please retry.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Focus Mode"
      description={`Active block: "${event.title}"`}
      size="sm"
    >
      <div className="space-y-6 text-center py-2">
        {/* Goal Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold">
          <Target className="h-3.5 w-3.5" />
          <span>{event.goalTitle || 'General Consistency'}</span>
        </div>

        {/* Digital Countdown Timer */}
        <div className="py-4">
          <div className="text-5xl sm:text-6xl font-extrabold text-foreground font-mono tracking-tight">
            {formattedTime}
          </div>
          <p className="text-xs text-muted-foreground font-semibold mt-2">
            {isRunning ? 'Flow state in progress' : 'Timer paused'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-3 rounded-2xl bg-primary hover:bg-primary-hover text-white transition-all shadow-md cursor-pointer"
            title={isRunning ? 'Pause' : 'Resume'}
          >
            {isRunning ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white" />}
          </button>
          <button
            onClick={() => setSecondsRemaining((event.durationMinutes || 30) * 60)}
            className="p-3 rounded-2xl bg-surface-elevated hover:bg-muted border border-border text-foreground transition-all cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>

        {/* Complete CTA */}
        <div className="pt-2 border-t border-border/60">
          <button
            onClick={handleComplete}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3px]" />
            <span>Complete Session</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
