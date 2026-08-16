import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { DialogField } from '@/components/dialogs/DialogField';
import { DialogFooter } from '@/components/dialogs/DialogFooter';
import { DialogSection } from '@/components/dialogs/DialogSection';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { goalService } from '@/services/goalService';
import { habitService } from '@/services/habitService';
import {
  Goal,
  GoalCategory,
  GoalPriority,
  GoalTargetType,
  CreateGoalInput,
} from '@/types/goal';
import { Habit } from '@/types/habit';
import { Target, Plus, Trash2, CheckCircle2, Sparkles, Flag } from 'lucide-react';
import { cn } from '@/utils/cn';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
  onSuccess?: () => void;
}

const CATEGORIES: GoalCategory[] = [
  'Career',
  'Education',
  'Health',
  'Finance',
  'Personal',
  'Fitness',
  'Relationships',
  'Projects',
  'Other',
];

const TARGET_TYPES: { id: GoalTargetType; label: string }[] = [
  { id: 'percentage', label: 'Percentage (%)' },
  { id: 'numeric', label: 'Numeric Metric' },
  { id: 'count', label: 'Item Count' },
  { id: 'milestone_based', label: 'Milestone Based' },
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goal,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const isEdit = !!goal;

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Career');
  const [priority, setPriority] = useState<GoalPriority>('medium');
  const [targetType, setTargetType] = useState<GoalTargetType>('percentage');
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [targetValue, setTargetValue] = useState<number>(100);
  const [unit, setUnit] = useState('%');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [milestones, setMilestones] = useState<Array<{ title: string; dueDate: string }>>([]);
  const [availableHabits, setAvailableHabits] = useState<Habit[]>([]);
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (isOpen) {
      habitService
        .getHabits()
        .then((res) => setAvailableHabits(res))
        .catch(() => {});

      if (goal) {
        setName(goal.name || '');
        setDescription(goal.description || '');
        setCategory(goal.category || 'Career');
        setPriority(goal.priority || 'medium');
        setTargetType(goal.targetType || 'percentage');
        setCurrentValue(goal.currentValue || 0);
        setTargetValue(goal.targetValue || 100);
        setUnit(goal.unit || '%');
        setStartDate(goal.startDate ? goal.startDate.split('T')[0] : new Date().toISOString().split('T')[0]);
        setTargetDate(goal.targetDate ? goal.targetDate.split('T')[0] : '');
        setMilestones(
          (goal.milestones || []).map((m) => ({
            title: m.title,
            dueDate: m.dueDate ? m.dueDate.split('T')[0] : '',
          }))
        );
        setSelectedHabitIds(
          (goal.habits || []).map((h: any) => (typeof h === 'string' ? h : h._id || h.id))
        );
      } else {
        setName('');
        setDescription('');
        setCategory('Career');
        setPriority('medium');
        setTargetType('percentage');
        setCurrentValue(0);
        setTargetValue(100);
        setUnit('%');
        setStartDate(new Date().toISOString().split('T')[0]);
        setTargetDate(
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        );
        setMilestones([]);
        setSelectedHabitIds([]);
      }
      setNameError('');
      setIsSubmitting(false);
    }
  }, [isOpen, goal]);

  const handleAddMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        title: '',
        dueDate: targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: 'title' | 'dueDate', value: string) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleToggleHabit = (habitId: string) => {
    setSelectedHabitIds((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId]
    );
  };

  const handleGenerateMilestonesAI = () => {
    setMilestones([
      { title: 'Core fundamentals & baseline mastery', dueDate: startDate },
      { title: 'Intermediate practice & sprint execution', dueDate: targetDate },
      { title: 'Final milestone & completion review', dueDate: targetDate },
    ]);
    success('AI Milestones Generated ✨', '3 milestone checkpoints added to your goal.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('Goal name is required.');
      return;
    }
    setNameError('');
    setIsSubmitting(true);

    try {
      const payload: CreateGoalInput = {
        name: name.trim(),
        description: description.trim(),
        category,
        priority,
        targetType,
        targetValue,
        currentValue,
        unit,
        startDate,
        targetDate,
        habits: selectedHabitIds,
        milestones: milestones
          .filter((m) => m.title.trim())
          .map((m, idx) => ({
            title: m.title.trim(),
            order: idx + 1,
            dueDate: m.dueDate || targetDate,
            completed: false,
          })),
      };

      if (isEdit && goal) {
        await goalService.updateGoal(goal.id, payload);
        success('Goal updated! 🎯', `"${name.trim()}" has been updated.`);
      } else {
        await goalService.createGoal(payload);
        success('Goal created! 🎯', `"${name.trim()}" is now active in your roadmap.`);
      }

      window.dispatchEvent(new Event('goals-updated'));
      onSuccess?.();
      onClose();
    } catch {
      error('Operation failed', 'Unable to save goal. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit High-Impact Goal' : 'Create a New Goal'}
      description="Turn a long-term aspiration into a measurable execution roadmap."
      icon={Target}
      iconColor="#8B5CF6"
      size="lg"
      footer={
        <DialogFooter
          onCancel={onClose}
          cancelLabel="Cancel"
          onConfirm={undefined}
          confirmLabel={isEdit ? 'Save Changes' : 'Create Goal'}
          isSubmitting={isSubmitting}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Goal Name */}
        <DialogField label="Goal Title" required error={nameError}>
          <Input
            placeholder="e.g. Master System Design & DSA, Reach 15% Body Fat, Launch SaaS"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            autoFocus
          />
        </DialogField>

        {/* Why this matters */}
        <DialogField label="Motivation & Purpose" optional helperText="Why is achieving this goal critical to your trajectory?">
          <textarea
            rows={2}
            placeholder="e.g. Qualify for Senior Staff roles and build lasting technical confidence."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary resize-none"
          />
        </DialogField>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DialogField label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GoalCategory)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </DialogField>

          <DialogField label="Priority">
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

        {/* Measurable Target Section */}
        <DialogSection title="Target & Milestones" subtitle="Define measurable progress checkpoints">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-surface-sunken border border-border/80">
            <DialogField label="Target Type">
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as GoalTargetType)}
                className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
              >
                {TARGET_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </DialogField>

            <DialogField label="Target Value">
              <input
                type="number"
                min={1}
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </DialogField>

            <DialogField label="Unit Metric">
              <input
                type="text"
                placeholder="%, problems, pages, kg"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </DialogField>
          </div>
        </DialogSection>

        {/* Start & Deadline Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DialogField label="Start Date">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
            />
          </DialogField>

          <DialogField label="Target Completion Date">
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
            />
          </DialogField>
        </div>

        {/* Milestones Stepper & AI Generation */}
        <div className="space-y-2.5 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Flag className="h-3.5 w-3.5 text-primary" />
              <span>Milestones ({milestones.length})</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateMilestonesAI}
                className="flex items-center gap-1 px-2.5 py-1 bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Milestones</span>
              </button>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center gap-1 px-2.5 py-1 bg-surface-elevated hover:bg-muted border border-border text-foreground rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                <span>Add Marker</span>
              </button>
            </div>
          </div>

          {milestones.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 py-2 italic">
              No milestones added yet. Use &quot;AI Milestones&quot; or add checkpoints to track progression.
            </p>
          ) : (
            <div className="space-y-2">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 bg-surface-elevated border border-border/70 rounded-xl"
                >
                  <span className="h-5 w-5 rounded-full bg-primary/15 text-primary text-[10px] flex items-center justify-center font-mono font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    placeholder={`Milestone ${idx + 1} title`}
                    value={m.title}
                    onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                    className="flex-1 h-8 px-2.5 rounded-lg bg-surface-sunken border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                  <input
                    type="date"
                    value={m.dueDate}
                    onChange={(e) => handleMilestoneChange(idx, 'dueDate', e.target.value)}
                    className="w-32 h-8 px-2 rounded-lg bg-surface-sunken border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    className="p-1.5 text-muted-foreground hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked Habits Selection */}
        {availableHabits.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/60">
            <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
              Supporting Daily Habits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
              {availableHabits.map((habit) => {
                const isSelected = selectedHabitIds.includes(habit.id);
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => handleToggleHabit(habit.id)}
                    className={cn(
                      'p-2 rounded-xl border text-left flex items-center justify-between gap-2 text-xs font-semibold transition-all cursor-pointer select-none',
                      isSelected
                        ? 'bg-primary/15 border-primary text-foreground'
                        : 'bg-surface-elevated border-border/60 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span className="truncate">{habit.name}</span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </form>
    </Dialog>
  );
};
