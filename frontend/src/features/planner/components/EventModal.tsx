import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { plannerService } from '@/services/plannerService';
import { goalService } from '@/services/goalService';
import { CalendarEvent, CalendarEventType, EventPriority } from '@/types/planner';
import { Goal } from '@/types/goal';
import {
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  BookOpen,
  Users,
  Coffee,
  Heart,
  Layers,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  initialDate?: string;
  onSuccess?: () => void;
}

const EVENT_TYPES: Array<{ id: CalendarEventType; label: string; icon: React.ComponentType<any>; color: string }> = [
  { id: 'TASK', label: 'Task', icon: CheckCircle2, color: '#3B82F6' },
  { id: 'HABIT', label: 'Habit', icon: Sparkles, color: '#F97316' },
  { id: 'GOAL_MILESTONE', label: 'Goal Milestone', icon: Target, color: '#8B5CF6' },
  { id: 'FOCUS', label: 'Focus Block', icon: Clock, color: '#6366F1' },
  { id: 'LEARNING', label: 'Learning', icon: BookOpen, color: '#06B6D4' },
  { id: 'HEALTH', label: 'Health / Workout', icon: Heart, color: '#10B981' },
  { id: 'MEETING', label: 'Meeting', icon: Users, color: '#EC4899' },
  { id: 'BREAK', label: 'Break', icon: Coffee, color: '#64748B' },
  { id: 'CUSTOM', label: 'Custom Block', icon: Layers, color: '#F59E0B' },
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  initialDate,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const isEdit = !!event;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CalendarEventType>('FOCUS');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');
  const [priority, setPriority] = useState<EventPriority>('medium');
  const [category, setCategory] = useState('Work');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekdays' | 'weekly'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (isOpen) {
      goalService.getGoals().then((res) => setGoals(res.goals)).catch(() => {});

      if (event) {
        setTitle(event.title || '');
        setDescription(event.description || '');
        setType(event.type || 'FOCUS');
        setDate(event.date || initialDate || new Date().toISOString().split('T')[0]);
        setStartTime(event.startTime || '09:00 AM');
        setEndTime(event.endTime || '10:30 AM');
        setPriority(event.priority || 'medium');
        setCategory(event.category || 'Work');
        setSelectedGoalId(event.goalId?._id || event.goalId || '');
        setRecurrence(event.recurrenceRule || 'none');
      } else {
        setTitle('');
        setDescription('');
        setType('FOCUS');
        setDate(initialDate || new Date().toISOString().split('T')[0]);
        setStartTime('09:00 AM');
        setEndTime('10:30 AM');
        setPriority('medium');
        setCategory('Work');
        setSelectedGoalId('');
        setRecurrence('none');
      }
      setTitleError('');
      setIsSubmitting(false);
    }
  }, [isOpen, event, initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError('Title is required.');
      return;
    }
    setTitleError('');
    setIsSubmitting(true);

    try {
      const selectedTypeObj = EVENT_TYPES.find((t) => t.id === type);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        date,
        startTime,
        endTime,
        priority,
        category,
        color: selectedTypeObj?.color || '#F97316',
        goalId: selectedGoalId || null,
        recurrenceRule: recurrence,
      };

      if (isEdit && event) {
        await plannerService.updateEvent(event.id, payload);
        success('Schedule updated! ✦', `"${title.trim()}" has been modified.`);
      } else {
        await plannerService.createEvent(payload);
        success('Event scheduled! 📅', `"${title.trim()}" added to your planner.`);
      }

      window.dispatchEvent(new Event('planner-updated'));
      onSuccess?.();
      onClose();
    } catch {
      error('Failed to schedule event', 'Please check your timings and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Scheduled Block' : 'Schedule New Block'}
      description="Design your time around high-leverage goals and routines."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* Title */}
        <div>
          <Input
            label="Block Title"
            placeholder="e.g. DSA Practice, Work Sprint, Morning Jog"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            error={titleError}
            autoFocus
          />
        </div>

        {/* Event Type Grid */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground block">Block Type</label>
          <div className="grid grid-cols-3 gap-1.5">
            {EVENT_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id);
                    if (t.id === 'HEALTH') setCategory('Fitness');
                    if (t.id === 'LEARNING' || t.id === 'HABIT') setCategory('Study');
                    if (t.id === 'TASK' || t.id === 'FOCUS') setCategory('Work');
                  }}
                  className={cn(
                    'p-2 rounded-xl border text-left flex items-center gap-2 text-xs font-bold transition-all cursor-pointer',
                    type === t.id
                      ? 'bg-primary/15 border-primary text-foreground shadow-sm'
                      : 'bg-surface-elevated border-border/70 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: t.color }} />
                  <span className="truncate text-[11px]">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Timings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Start Time</label>
            <input
              type="text"
              placeholder="09:00 AM"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">End Time</label>
            <input
              type="text"
              placeholder="10:30 AM"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Goal Relationship */}
        {goals.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground block">
              Connect to Goal (Optional)
            </label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">No linked goal</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  🎯 {g.name} ({g.progress}%)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Recurrence & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              Recurrence
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="none">One-time Block</option>
              <option value="daily">Every Day</option>
              <option value="weekdays">Every Weekday (Mon–Fri)</option>
              <option value="weekly">Every Week</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Priority</label>
            <div className="grid grid-cols-4 gap-1">
              {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    'h-10 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer',
                    priority === p
                      ? p === 'critical'
                        ? 'bg-danger/20 border-danger text-danger'
                        : p === 'high'
                        ? 'bg-warning/20 border-warning text-warning'
                        : p === 'medium'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-muted border-border text-foreground'
                      : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEdit ? 'Save Block' : 'Add to Schedule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
