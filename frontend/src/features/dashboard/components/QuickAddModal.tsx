import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { todayService } from '@/services/todayService';
import { HabitCategory } from '@/types/habit';
import { QuickAddType } from '@/types/today';
import { CheckCircle2, ListTodo, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

const CATEGORIES: HabitCategory[] = [
  'Health',
  'Fitness',
  'Study',
  'Work',
  'Personal',
  'Finance',
  'Mindfulness',
  'Creativity',
  'Other',
];

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialType?: QuickAddType;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'habit',
}) => {
  const { success, error } = useToast();
  const [activeType, setActiveType] = useState<QuickAddType>(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common / Habit state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Personal');
  const [time, setTime] = useState('07:30 PM');
  const [durationMins, setDurationMins] = useState<number>(30);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [endTime, setEndTime] = useState('08:30 PM');
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveType(initialType);
      setTitle('');
      setTitleError('');
      setIsSubmitting(false);
    }
  }, [isOpen, initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || title.trim().length < 2) {
      setTitleError('Please enter a valid title (at least 2 characters).');
      return;
    }
    setTitleError('');
    setIsSubmitting(true);

    try {
      if (activeType === 'habit') {
        await todayService.quickAddHabit({
          name: title.trim(),
          category,
          preferredTime: time,
          duration: durationMins,
        });
        success('Habit added! ✓', `"${title.trim()}" is scheduled for today.`);
        window.dispatchEvent(new Event('habits-updated'));
      } else if (activeType === 'task') {
        await todayService.quickAddTask({
          title: title.trim(),
          scheduledStart: time,
          estimatedMinutes: durationMins,
          priority,
        });
        success('Task scheduled! ✓', `"${title.trim()}" added to today's plan.`);
        window.dispatchEvent(new Event('tasks-updated'));
      } else if (activeType === 'event') {
        await todayService.quickAddTask({
          title: title.trim(),
          scheduledStart: `${time} - ${endTime}`,
          estimatedMinutes: durationMins || 60,
          priority: 'medium',
        });
        success('Event scheduled! ✓', `"${title.trim()}" saved to calendar.`);
        window.dispatchEvent(new Event('tasks-updated'));
      }

      onSuccess?.();
      onClose();
    } catch {
      error('Creation failed', 'Unable to save. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Add"
      description="Quickly capture a habit, task, or event into today's plan."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-sunken border border-border/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveType('habit')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeType === 'habit'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Habit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('task')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeType === 'task'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ListTodo className="h-3.5 w-3.5" />
            <span>Task</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('event')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer',
              activeType === 'event'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Event</span>
          </button>
        </div>

        {/* Title Input */}
        <div>
          <Input
            label={activeType === 'habit' ? 'Habit Name' : activeType === 'task' ? 'Task Title' : 'Event Name'}
            placeholder={
              activeType === 'habit'
                ? 'e.g. DSA Practice, Evening Walk, Journaling'
                : activeType === 'task'
                ? 'e.g. Deploy auth microservice, Submit report'
                : 'e.g. Team sync, Mentorship call'
            }
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            error={titleError}
            autoFocus
          />
        </div>

        {/* Dynamic Fields by Type */}
        {activeType === 'habit' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HabitCategory)}
                className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="07:30 PM"
                className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                min={5}
                max={360}
                step={5}
                value={durationMins}
                onChange={(e) => setDurationMins(parseInt(e.target.value, 10) || 30)}
                className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {activeType === 'task' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  Scheduled Time
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="03:00 PM"
                  className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  Estimated Duration (min)
                </label>
                <input
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  value={durationMins}
                  onChange={(e) => setDurationMins(parseInt(e.target.value, 10) || 30)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'py-1.5 rounded-lg text-xs font-bold capitalize transition-all border cursor-pointer',
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
        )}

        {activeType === 'event' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="11:00 AM"
                className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Add to Today
          </Button>
        </div>
      </form>
    </Modal>
  );
};
