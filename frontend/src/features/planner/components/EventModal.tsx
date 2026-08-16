import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { DialogField } from '@/components/dialogs/DialogField';
import { DialogFooter } from '@/components/dialogs/DialogFooter';
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
  Calendar,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  initialDate?: string;
  onSuccess?: () => void;
}

const EVENT_TYPES: Array<{
  id: CalendarEventType;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}> = [
  { id: 'FOCUS', label: 'Focus Block', icon: Clock, color: '#6366F1' },
  { id: 'TASK', label: 'Task Execution', icon: CheckCircle2, color: '#3B82F6' },
  { id: 'HABIT', label: 'Daily Habit', icon: Sparkles, color: '#F97316' },
  { id: 'GOAL_MILESTONE', label: 'Goal Milestone', icon: Target, color: '#8B5CF6' },
  { id: 'LEARNING', label: 'Learning / Study', icon: BookOpen, color: '#06B6D4' },
  { id: 'HEALTH', label: 'Workout / Health', icon: Heart, color: '#10B981' },
  { id: 'MEETING', label: 'Meeting', icon: Users, color: '#EC4899' },
  { id: 'BREAK', label: 'Rest / Break', icon: Coffee, color: '#64748B' },
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
      goalService
        .getGoals()
        .then((res) => setGoals(res.goals || []))
        .catch(() => {});

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
      setTitleError('Block title is required.');
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
        success('Event scheduled! 📅', `"${title.trim()}" added to execution calendar.`);
      }

      window.dispatchEvent(new Event('planner-updated'));
      onSuccess?.();
      onClose();
    } catch {
      error('Failed to schedule event', 'Please check timings and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTypeObj = EVENT_TYPES.find((t) => t.id === type) || EVENT_TYPES[0];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Scheduled Block' : 'Schedule New Block'}
      description="Design your time around high-leverage goals and routines."
      icon={Calendar}
      iconColor={selectedTypeObj.color}
      size="md"
      footer={
        <DialogFooter
          onCancel={onClose}
          cancelLabel="Cancel"
          onConfirm={undefined}
          confirmLabel={isEdit ? 'Save Block' : 'Add to Schedule'}
          isSubmitting={isSubmitting}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Title */}
        <DialogField label="Block Title" required error={titleError}>
          <Input
            placeholder="e.g. 90m Deep Work Sprint, DSA Mock, Morning Run"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            autoFocus
          />
        </DialogField>

        {/* Event Type Grid */}
        <DialogField label="Block Type">
          <div className="grid grid-cols-3 gap-1.5">
            {EVENT_TYPES.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.id;
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
                    'p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-bold transition-all cursor-pointer select-none',
                    isSelected
                      ? 'bg-primary/15 border-primary text-foreground shadow-sm'
                      : 'bg-surface-sunken border-border/70 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" style={{ color: t.color }} />
                  <span className="truncate text-[11px]">{t.label}</span>
                </button>
              );
            })}
          </div>
        </DialogField>

        {/* Date & Timings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <DialogField label="Execution Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
            />
          </DialogField>

          <DialogField label="Start Time">
            <input
              type="text"
              placeholder="09:00 AM"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </DialogField>

          <DialogField label="End Time">
            <input
              type="text"
              placeholder="10:30 AM"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </DialogField>
        </div>

        {/* Goal Relationship */}
        {goals.length > 0 && (
          <DialogField label="Connect to High-Impact Goal" optional>
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
          </DialogField>
        )}

        {/* Recurrence & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DialogField label="Recurrence">
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
          </DialogField>

          <DialogField label="Priority Level">
            <div className="grid grid-cols-4 gap-1">
              {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    'h-10 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer select-none',
                    priority === p
                      ? p === 'critical'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : p === 'high'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : p === 'medium'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-muted border-border text-foreground'
                      : 'bg-surface-sunken border-border/60 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </DialogField>
        </div>
      </form>
    </Dialog>
  );
};
