import React, { useState } from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { DialogFooter } from '@/components/dialogs/DialogFooter';
import { useToast } from '@/hooks/useToast';
import { habitService } from '@/services/habitService';
import {
  HabitCategory,
  HabitFrequency,
  TrackingType,
  DifficultyLevel,
  FrictionLevel,
} from '@/types/habit';
import { HabitBasicsSection, CATEGORY_OPTIONS } from './HabitBasicsSection';
import { HabitScheduleSection } from './HabitScheduleSection';
import { HabitTargetSection } from './HabitTargetSection';
import { HabitRemindersSection } from './HabitRemindersSection';
import { HabitDifficultySection } from './HabitDifficultySection';
import { HabitPreviewCard } from './HabitPreviewCard';
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialCategory?: HabitCategory;
}

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCategory,
}) => {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>(initialCategory || 'Health');

  React.useEffect(() => {
    if (isOpen && initialCategory) {
      setCategory(initialCategory);
    }
  }, [isOpen, initialCategory]);
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [preferredTime, setPreferredTime] = useState('07:30');
  const [timeWindowStart, setTimeWindowStart] = useState('07:00');
  const [timeWindowEnd, setTimeWindowEnd] = useState('09:00');
  const [isWindowFlexible, setIsWindowFlexible] = useState(false);

  const [trackingType, setTrackingType] = useState<TrackingType>('binary');
  const [targetValue, setTargetValue] = useState(1);
  const [targetUnit, setTargetUnit] = useState('times');
  const [checklistItems, setChecklistItems] = useState<string[]>([]);

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('07:15');

  const [difficulty, setDifficulty] = useState<DifficultyLevel>('moderate');
  const [expectedFriction, setExpectedFriction] = useState<FrictionLevel>('medium');

  // Progressive Disclosure Sections
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [nameError, setNameError] = useState('');

  const resetForm = () => {
    setName('');
    setCategory('Health');
    setDescription('');
    setFrequency('daily');
    setCustomDays([1, 2, 3, 4, 5]);
    setPreferredTime('07:30');
    setTimeWindowStart('07:00');
    setTimeWindowEnd('09:00');
    setIsWindowFlexible(false);
    setTrackingType('binary');
    setTargetValue(1);
    setTargetUnit('times');
    setChecklistItems([]);
    setReminderEnabled(false);
    setReminderTime('07:15');
    setDifficulty('moderate');
    setExpectedFriction('medium');
    setNameError('');
    setShowAdvanced(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 2) {
      setNameError('Habit name must be at least 2 characters.');
      return;
    }
    setNameError('');

    if ((frequency === 'specific_days' || frequency === 'custom') && customDays.length === 0) {
      error('Schedule required', 'Please select at least 1 day for your habit schedule.');
      return;
    }

    const catObj = CATEGORY_OPTIONS.find((c) => c.category === category);
    const icon = catObj ? catObj.icon : 'target';

    setIsSubmitting(true);
    try {
      await habitService.createHabit({
        name: name.trim(),
        description: description.trim(),
        category,
        icon,
        trackingType,
        frequency,
        customDays: frequency === 'specific_days' || frequency === 'custom' ? customDays : [],
        targetValue: trackingType === 'binary' ? 1 : targetValue,
        unit: trackingType === 'binary' ? 'times' : targetUnit,
        preferredTime,
        timeWindowStart: isWindowFlexible ? timeWindowStart : '',
        timeWindowEnd: isWindowFlexible ? timeWindowEnd : '',
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : '',
        difficulty,
        expectedFriction,
        checklistItems: trackingType === 'checklist' ? checklistItems : [],
        startDate: new Date().toISOString().split('T')[0],
      });

      success('Habit created! ✓', `"${name.trim()}" added to your Daily Forge routine.`);
      resetForm();
      onClose();

      // Dispatch event to refresh dashboard / habits
      window.dispatchEvent(new Event('habits-updated'));
      if (onSuccess) onSuccess();
    } catch {
      error('Creation failed', 'Could not create habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Create New Habit"
      description="Build a routine that fits your life, not the other way around."
      icon={CheckCircle2}
      iconColor="#F97316"
      size="lg"
      footer={
        <DialogFooter
          onCancel={() => {
            resetForm();
            onClose();
          }}
          cancelLabel="Cancel"
          onConfirm={undefined}
          confirmLabel="Create Habit"
          isSubmitting={isSubmitting}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left pt-1">
        {/* 1. BASICS SECTION */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-mono">
              1
            </span>
            <span>Basics</span>
          </div>
          <HabitBasicsSection
            name={name}
            onChangeName={(v) => {
              setName(v);
              if (nameError) setNameError('');
            }}
            category={category}
            onChangeCategory={setCategory}
            description={description}
            onChangeDescription={setDescription}
            errorName={nameError}
          />
        </section>

        {/* 2. FREQUENCY & SCHEDULE */}
        <section className="space-y-2.5 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-mono">
              2
            </span>
            <span>Frequency & Schedule</span>
          </div>
          <HabitScheduleSection
            frequency={frequency}
            onChangeFrequency={setFrequency}
            customDays={customDays}
            onChangeCustomDays={setCustomDays}
            preferredTime={preferredTime}
            onChangePreferredTime={setPreferredTime}
            timeWindowStart={timeWindowStart}
            onChangeTimeWindowStart={setTimeWindowStart}
            timeWindowEnd={timeWindowEnd}
            onChangeTimeWindowEnd={setTimeWindowEnd}
            isWindowFlexible={isWindowFlexible}
            onToggleFlexibleWindow={setIsWindowFlexible}
          />
        </section>

        {/* 3. TARGET & MEASUREMENT */}
        <section className="space-y-2.5 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-mono">
              3
            </span>
            <span>Target & Tracking</span>
          </div>
          <HabitTargetSection
            trackingType={trackingType}
            onChangeTrackingType={setTrackingType}
            targetValue={targetValue}
            onChangeTargetValue={setTargetValue}
            targetUnit={targetUnit}
            onChangeTargetUnit={setTargetUnit}
            checklistItems={checklistItems}
            onChangeChecklistItems={setChecklistItems}
          />
        </section>

        {/* ADVANCED COLLAPSIBLE OPTIONS (Reminders & Difficulty) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full py-2 px-3 rounded-xl bg-surface-sunken/40 hover:bg-surface-elevated border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Reminders & Difficulty Settings</span>
            </span>
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-3 motion-safe:animate-fade-in">
              {/* 4. REMINDERS */}
              <section className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  4. Reminders
                </div>
                <HabitRemindersSection
                  reminderEnabled={reminderEnabled}
                  onToggleReminder={setReminderEnabled}
                  reminderTime={reminderTime}
                  onChangeReminderTime={setReminderTime}
                />
              </section>

              {/* 5. DIFFICULTY & EXPECTATIONS */}
              <section className="space-y-2 pt-3 border-t border-border/50">
                <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  5. Difficulty & Expectations
                </div>
                <HabitDifficultySection
                  difficulty={difficulty}
                  onChangeDifficulty={setDifficulty}
                  expectedFriction={expectedFriction}
                  onChangeExpectedFriction={setExpectedFriction}
                />
              </section>
            </div>
          )}
        </div>

        {/* 6. LIVE PREVIEW */}
        <HabitPreviewCard
          name={name}
          category={category}
          frequency={frequency}
          customDays={customDays}
          preferredTime={preferredTime}
          trackingType={trackingType}
          targetValue={targetValue}
          targetUnit={targetUnit}
          reminderEnabled={reminderEnabled}
          reminderTime={reminderTime}
          difficulty={difficulty}
        />
      </form>
    </Dialog>
  );
};
