import React, { useState } from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { useToast } from '@/hooks/useToast';
import { plannerService } from '@/services/plannerService';
import { CalendarEvent } from '@/types/planner';
import {
  Target,
  Play,
  Check,
  RotateCcw,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEdit: (event: CalendarEvent) => void;
  onStartFocus: (event: CalendarEvent) => void;
  onSuccess?: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  onEdit,
  onStartFocus,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newTime, setNewTime] = useState('08:00 PM');
  const [newDate, setNewDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) return null;

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await plannerService.completeEvent(event.id);
      success('Session completed! ✦', `Logged completion for "${event.title}".`);
      window.dispatchEvent(new Event('planner-updated'));
      window.dispatchEvent(new Event('habits-updated'));
      onSuccess?.();
      onClose();
    } catch {
      error('Complete failed', 'Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await plannerService.rescheduleEvent({
        id: event.id,
        newDate: newDate || event.date,
        newStartTime: newTime,
      });
      success('Block rescheduled! 📅', `Moved to ${newTime}.`);
      window.dispatchEvent(new Event('planner-updated'));
      setIsRescheduling(false);
      onSuccess?.();
      onClose();
    } catch {
      error('Reschedule failed', 'Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this scheduled block?')) return;
    try {
      await plannerService.deleteEvent(event.id);
      success('Block removed', 'Event cleared from planner.');
      window.dispatchEvent(new Event('planner-updated'));
      onSuccess?.();
      onClose();
    } catch {
      error('Deletion failed', 'Please retry.');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      description={`${event.startTime} — ${event.endTime} (${event.durationMinutes} min)`}
      icon={Calendar}
      iconColor="#3B82F6"
      size="md"
    >
      <div className="space-y-4 text-left pt-1">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full uppercase">
            {event.type}
          </span>
          <span className="text-[10px] font-bold bg-surface-sunken px-2.5 py-0.5 rounded-full border border-border text-muted-foreground uppercase">
            {event.category}
          </span>
          <span
            className={cn(
              'text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border',
              event.status === 'completed'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                : event.status === 'in_progress'
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'bg-surface-sunken border-border text-muted-foreground'
            )}
          >
            {event.status}
          </span>
        </div>

        {/* Goal Alignment Banner */}
        <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 space-y-1.5">
          <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Target className="h-3 w-3" />
            <span>Goal Alignment</span>
          </span>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-foreground">{event.goalTitle || 'General Consistency'}</span>
            <span className="text-emerald-500 dark:text-emerald-400 font-mono">
              {event.expectedGoalContribution || '+1.2% Goal Progress'}
            </span>
          </div>
        </div>

        {/* Description if present */}
        {event.description && (
          <div className="space-y-1 text-xs font-semibold">
            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Notes</span>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Reschedule Inline Form */}
        {isRescheduling ? (
          <form onSubmit={handleReschedule} className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-3">
            <h4 className="text-xs font-extrabold text-foreground">Select New Timing</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground block mb-1">Date</label>
                <input
                  type="date"
                  value={newDate || event.date}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg bg-surface-sunken border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground block mb-1">Start Time</label>
                <input
                  type="text"
                  placeholder="08:00 PM"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg bg-surface-sunken border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsRescheduling(false)}
                className="px-2.5 py-1 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                Confirm Move
              </button>
            </div>
          </form>
        ) : null}

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60">
          <button
            onClick={() => {
              onClose();
              onStartFocus(event);
            }}
            className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>Focus Mode</span>
          </button>

          <button
            onClick={handleComplete}
            disabled={isSubmitting || event.status === 'completed'}
            className="p-2.5 rounded-xl bg-surface-elevated hover:bg-emerald-500/15 hover:border-emerald-500/40 border border-border text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>{event.status === 'completed' ? 'Completed' : 'Complete'}</span>
          </button>

          <button
            onClick={() => setIsRescheduling(true)}
            className="p-2.5 rounded-xl bg-surface-elevated hover:bg-muted border border-border text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reschedule</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onEdit(event);
            }}
            className="p-2.5 rounded-xl bg-surface-elevated hover:bg-muted border border-border text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Delete Link */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleDelete}
            className="text-[11px] font-bold text-muted-foreground hover:text-danger flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Remove from Planner</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
};
