import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
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
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null; // If provided, edit mode
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
  const [targetDate, setTargetDate] = useState('');
  const [milestones, setMilestones] = useState<
    Array<{ title: string; weight: number; dueDate: string }>
  >([]);
  const [availableHabits, setAvailableHabits] = useState<Habit[]>([]);
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load habits for linking
      habitService.getHabits().then(setAvailableHabits).catch(() => {});

      if (goal) {
        setName(goal.name || '');
        setDescription(goal.description || '');
        setCategory(goal.category || 'Career');
        setPriority(goal.priority || 'medium');
        setTargetType(goal.targetType || 'percentage');
        setCurrentValue(goal.currentValue || 0);
        setTargetValue(goal.targetValue || 100);
        setUnit(goal.unit || '%');
        setStartDate(goal.startDate || new Date().toISOString().split('T')[0]);
        setTargetDate(goal.targetDate || goal.deadline || '');
        setMilestones(
          (goal.milestones || []).map((m) => ({
            title: m.title,
            weight: m.weight || 1,
            dueDate: m.dueDate || '',
          }))
        );
        setSelectedHabitIds(
          (goal.habits || []).map((h) => (typeof h === 'string' ? h : h._id || h.id))
        );
      } else {
        // Reset for create
        setName('');
        setDescription('');
        setCategory('Career');
        setPriority('medium');
        setTargetType('percentage');
        setCurrentValue(0);
        setTargetValue(100);
        setUnit('%');
        setStartDate(new Date().toISOString().split('T')[0]);
        setTargetDate('');
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
      { title: '', weight: 1, dueDate: targetDate || '' },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMilestoneChange = (index: number, field: string, value: any) => {
    setMilestones((prev) =>
      prev.map((m, idx) => (idx === index ? { ...m, [field]: value } : m))
    );
  };

  const handleToggleHabit = (habitId: string) => {
    setSelectedHabitIds((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 2) {
      setNameError('Goal name must be at least 2 characters.');
      return;
    }
    setNameError('');

    if (targetDate && startDate && new Date(targetDate) < new Date(startDate)) {
      error('Invalid target date', 'Target date cannot precede the start date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateGoalInput = {
        name: name.trim(),
        description: description.trim(),
        category,
        priority,
        targetType,
        currentValue: Number(currentValue) || 0,
        targetValue: Number(targetValue) || 100,
        unit: unit.trim() || '%',
        startDate,
        targetDate: targetDate || undefined,
        deadline: targetDate || undefined,
        habits: selectedHabitIds,
        milestones: milestones.filter((m) => m.title.trim().length > 0),
      };

      if (isEdit && goal) {
        await goalService.updateGoal(goal.id, payload);
        success('Goal updated! ✦', `"${name.trim()}" has been modified.`);
      } else {
        await goalService.createGoal(payload);
        success('Goal created! 🎯', `"${name.trim()}" added to your active ambitions.`);
      }

      window.dispatchEvent(new Event('goals-updated'));
      onSuccess?.();
      onClose();
    } catch {
      error('Failed to save goal', 'Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Goal' : 'Create New Goal'}
      description="Turn long-term ambitions into structured daily actions and milestones."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* Goal Name */}
        <div>
          <Input
            label="Goal Name"
            placeholder="e.g. Become ML Engineer, Establish Coding System, Run 10k"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            error={nameError}
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground">Description & Why</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does success look like and why does this goal matter?"
            className="w-full p-2.5 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary resize-none"
          />
        </div>

        {/* Category & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              Category
            </label>
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
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              Priority
            </label>
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

        {/* Target Metrics */}
        <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 space-y-3">
          <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">
            Measurable Target
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Target Type
              </label>
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
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Target Value
              </label>
              <input
                type="number"
                min={1}
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Unit
              </label>
              <input
                type="text"
                placeholder="%, problems, pages, kg"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              Target Completion Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Dynamic Milestones Section */}
        <div className="space-y-2 pt-1 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-foreground">Milestones</h4>
              <p className="text-[10px] text-muted-foreground">Break ambition down into segmented markers</p>
            </div>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="flex items-center gap-1 px-2.5 py-1 bg-surface-elevated hover:bg-muted border border-border text-primary rounded-lg text-xs font-bold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>

          {milestones.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 py-2 italic">
              No milestones added. Click &quot;Add Milestone&quot; to define milestones.
            </p>
          ) : (
            <div className="space-y-2">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 bg-surface-elevated border border-border/70 rounded-xl"
                >
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
                    className="p-1.5 text-muted-foreground hover:text-danger rounded-lg transition-colors cursor-pointer"
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
          <div className="space-y-2 pt-1 border-t border-border/60">
            <h4 className="text-xs font-extrabold text-foreground">Linked Daily Habits</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
              {availableHabits.map((habit) => {
                const isSelected = selectedHabitIds.includes(habit.id);
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => handleToggleHabit(habit.id)}
                    className={cn(
                      'p-2 rounded-xl border text-left flex items-center justify-between gap-2 text-xs font-semibold transition-all cursor-pointer',
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

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
