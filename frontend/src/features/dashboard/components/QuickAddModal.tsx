import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { DialogTabs, DialogTabItem } from '@/components/dialogs/DialogTabs';
import { DialogField } from '@/components/dialogs/DialogField';
import { DialogFooter } from '@/components/dialogs/DialogFooter';
import { SmartSuggestion } from '@/components/dialogs/SmartSuggestion';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { todayService } from '@/services/todayService';
import { goalService } from '@/services/goalService';
import { HabitCategory } from '@/types/habit';
import { QuickAddType } from '@/types/today';
import { Goal } from '@/types/goal';
import { CheckCircle2, ListTodo, Calendar, Plus } from 'lucide-react';
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
  initialDate?: string;
  initialGoalId?: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'habit',
  initialGoalId,
}) => {
  const { success, error } = useToast();
  const [activeType, setActiveType] = useState<QuickAddType>(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Personal');
  const [time, setTime] = useState('07:30 PM');
  const [durationMins, setDurationMins] = useState<number>(30);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [endTime, setEndTime] = useState('08:30 PM');
  const [selectedGoalId, setSelectedGoalId] = useState<string>(initialGoalId || '');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveType(initialType);
      setTitle('');
      setTitleError('');
      setIsSubmitting(false);
      if (initialGoalId) setSelectedGoalId(initialGoalId);
      goalService
        .getGoals()
        .then((res) => setGoals(res.goals || []))
        .catch(() => {});
    }
  }, [isOpen, initialType, initialGoalId]);

  const tabs: DialogTabItem<QuickAddType>[] = [
    { id: 'habit', label: 'Habit Routine', icon: CheckCircle2 },
    { id: 'task', label: 'One-off Task', icon: ListTodo },
    { id: 'event', label: 'Calendar Event', icon: Calendar },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || title.trim().length < 2) {
      setTitleError('Please enter a descriptive title (at least 2 characters).');
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
        success('Habit added! ✓', `"${title.trim()}" is scheduled in today's routines.`);
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
      error('Creation failed', 'Unable to save. Please check inputs and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentIcon =
    activeType === 'habit' ? CheckCircle2 : activeType === 'task' ? ListTodo : Calendar;
  const currentIconColor =
    activeType === 'habit' ? '#F97316' : activeType === 'task' ? '#3B82F6' : '#8B5CF6';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        activeType === 'habit'
          ? 'Add Daily Habit'
          : activeType === 'task'
          ? 'Create Execution Task'
          : 'Schedule Calendar Event'
      }
      description="Quickly capture a routine, action item, or timeblock into DailyForge."
      icon={currentIcon}
      iconColor={currentIconColor}
      size="md"
      footer={
        <DialogFooter
          onCancel={onClose}
          cancelLabel="Cancel"
          onConfirm={undefined}
          confirmLabel={
            activeType === 'habit'
              ? 'Add Habit'
              : activeType === 'task'
              ? 'Schedule Task'
              : 'Save Event'
          }
          isSubmitting={isSubmitting}
          confirmIcon={Plus}
          hintText="Press ↵ to add"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Segmented Type Selector */}
        <DialogTabs tabs={tabs} activeTab={activeType} onChange={setActiveType} />

        {/* Title Input */}
        <DialogField
          label={
            activeType === 'habit'
              ? 'Habit Name'
              : activeType === 'task'
              ? 'Task Title'
              : 'Event Name'
          }
          required
          error={titleError}
        >
          <Input
            placeholder={
              activeType === 'habit'
                ? 'e.g. 20m DSA Practice, Morning Run, Read 10 Pages'
                : activeType === 'task'
                ? 'e.g. Deploy auth microservice, Submit thesis draft'
                : 'e.g. Weekly architecture review, Mentorship call'
            }
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            autoFocus
          />
        </DialogField>

        {/* Dynamic Fields for HABIT */}
        {activeType === 'habit' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <DialogField label="Category">
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
              </DialogField>

              <DialogField label="Preferred Time">
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="07:30 PM"
                  className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </DialogField>

              <DialogField label="Duration (min)">
                <input
                  type="number"
                  min={5}
                  max={360}
                  step={5}
                  value={durationMins}
                  onChange={(e) => setDurationMins(parseInt(e.target.value, 10) || 30)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </DialogField>
            </div>

            {/* Smart Habit Stacking AI Insight */}
            <SmartSuggestion
              title="DailyForge Routine Signal"
              suggestion="Start with 15–20 minutes to anchor initial consistency."
              reason="Historical analytics show routines under 30 mins achieve 88% higher streak adherence in month 1."
              onApply={() => setDurationMins(20)}
              applied={durationMins === 20}
              applyLabel="Set 20 mins"
            />
          </div>
        )}

        {/* Dynamic Fields for TASK */}
        {activeType === 'task' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DialogField label="Scheduled Start">
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="03:00 PM"
                  className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </DialogField>

              <DialogField label="Estimated Duration (min)">
                <input
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  value={durationMins}
                  onChange={(e) => setDurationMins(parseInt(e.target.value, 10) || 30)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </DialogField>
            </div>

            {/* Priority Chips */}
            <DialogField label="Execution Priority">
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'py-2 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer select-none',
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

            {/* Optional Goal Link */}
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
          </div>
        )}

        {/* Dynamic Fields for EVENT */}
        {activeType === 'event' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DialogField label="Start Time">
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="10:00 AM"
                  className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </DialogField>

              <DialogField label="End Time">
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="11:00 AM"
                  className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </DialogField>
            </div>
          </div>
        )}
      </form>
    </Dialog>
  );
};
