import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { useToast } from '@/hooks/useToast';
import { habitService } from '@/services/habitService';
import { experimentService } from '@/services/experimentService';
import { Habit } from '@/types/habit';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Flame,
  Beaker,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ExperimentBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTemplate?: {
    title: string;
    category: string;
    description: string;
  } | null;
}

export const ExperimentBuilderModal: React.FC<ExperimentBuilderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTemplate,
}) => {
  const { success, error } = useToast();
  const [step, setStep] = useState(1);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Wizard state
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');
  const [interventionType, setInterventionType] = useState('SCHEDULE_TIME');
  const [originalTime, setOriginalTime] = useState('09:00 PM');
  const [experimentTime, setExperimentTime] = useState('07:30 PM');
  const [durationDays, setDurationDays] = useState(14);
  const [targetValue, setTargetValue] = useState(80);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      habitService
        .getHabits()
        .then((res) => {
          setHabits(res);
          if (res.length > 0) {
            setSelectedHabitId(res[0].id);
            setOriginalTime(res[0].preferredTime || '09:00 PM');
          }
        })
        .finally(() => setLoadingHabits(false));

      if (initialTemplate) {
        setName(initialTemplate.title);
        setInterventionType(initialTemplate.category);
      }
    }
  }, [isOpen, initialTemplate]);

  const handleHabitChange = (hId: string) => {
    setSelectedHabitId(hId);
    const selected = habits.find((h) => h.id === hId);
    if (selected) {
      setOriginalTime(selected.preferredTime || '09:00 PM');
      if (!name) setName(`${selected.name} Schedule Shift`);
      if (!question) setQuestion(`Does changing ${selected.name} improve completion?`);
      if (!hypothesis) {
        setHypothesis(
          `If I move ${selected.name} to 7:30 PM, then completion rate will increase from 72% to at least 80%, because evening focus is stronger.`
        );
      }
    }
  };

  const handleUseInsight = () => {
    setHypothesis(
      'If I move this routine to 7:30 PM, completion will increase to 82%, because Analytics detected 18% higher evening consistency.'
    );
  };

  const handleLaunch = async () => {
    setSubmitting(true);
    try {
      const habit = habits.find((h) => h.id === selectedHabitId);
      await experimentService.createExperiment({
        name: name || `${habit?.name || 'Habit'} Optimization`,
        question: question || `Does changing ${habit?.name || 'routine'} improve completion?`,
        hypothesis: hypothesis || `If I test this intervention, completion will reach ${targetValue}%.`,
        habitId: selectedHabitId || null,
        category: habit?.category || 'General',
        interventionType,
        interventionDetails: {
          originalTime,
          experimentTime,
        },
        durationDays,
        targetValue,
      });

      success('Experiment Started! ✦', `Test is now active for ${durationDays} days.`);
      onSuccess?.();
      onClose();
    } catch {
      error('Failed to launch experiment', 'Please check your parameters and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedHabit = habits.find((h) => h.id === selectedHabitId);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Personal Experiment"
      description={`Step ${step} of 4 · Scientific Routine Optimization`}
      icon={Beaker}
      iconColor="#8B5CF6"
      size="md"
    >
      <div className="space-y-4 text-left pt-1">
        {/* Step 1: Define Question & Select Habit */}
        {step === 1 && (
          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-1">
                Select Habit to Experiment On
              </label>
              {loadingHabits ? (
                <div className="h-10 bg-surface-sunken rounded-xl animate-pulse" />
              ) : (
                <select
                  value={selectedHabitId}
                  onChange={(e) => handleHabitChange(e.target.value)}
                  className="w-full bg-surface-sunken border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  {habits.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.completionRate || 75}% completion • {h.category})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-1">
                Experiment Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Evening DSA Schedule Shift"
                className="w-full bg-surface-sunken border border-border rounded-xl px-3.5 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-1">
                Core Research Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Does moving DSA Practice from 9 PM to 7:30 PM improve completion?"
                className="w-full bg-surface-sunken border border-border rounded-xl px-3.5 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Step 2: Formulate Hypothesis */}
        {step === 2 && (
          <div className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                  Formulate Hypothesis
                </label>
                <button
                  type="button"
                  onClick={handleUseInsight}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Use Analytics Insight</span>
                </button>
              </div>
              <textarea
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                rows={3}
                placeholder="If I [intervention], then [expected outcome], because [reason]."
                className="w-full bg-surface-sunken border border-border rounded-xl p-3 text-xs font-semibold text-foreground focus:outline-none focus:border-primary resize-none leading-relaxed"
              />
            </div>

            {/* Smart Insight Pill */}
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2.5 text-xs">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-primary font-bold block text-[11px]">
                  Analytics Signal Detected
                </span>
                <p className="text-muted-foreground text-[11px] leading-snug">
                  Observational habit data indicates your evening completion rate is 23 points higher than late-night sessions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Define Intervention & Schedule */}
        {step === 3 && (
          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-1">
                Intervention Strategy
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'SCHEDULE_TIME', label: 'Shift Time Window', icon: Zap },
                  { id: 'REDUCE_FRICTION', label: 'Reduce Friction', icon: ShieldCheck },
                  { id: 'HABIT_STACK', label: 'Habit Stacking', icon: Flame },
                  { id: 'MINIMUM_VIABLE', label: 'Minimum Viable', icon: Sparkles },
                ].map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setInterventionType(type.id)}
                      className={cn(
                        'p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-left',
                        interventionType === type.id
                          ? 'bg-primary/15 border-primary text-foreground'
                          : 'bg-surface-sunken border-border/80 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-1">
                  Baseline Time
                </label>
                <input
                  type="text"
                  value={originalTime}
                  onChange={(e) => setOriginalTime(e.target.value)}
                  className="w-full bg-surface-sunken border border-border rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-primary uppercase tracking-wider block mb-1">
                  Experiment Time
                </label>
                <input
                  type="text"
                  value={experimentTime}
                  onChange={(e) => setExperimentTime(e.target.value)}
                  className="w-full bg-surface-sunken border border-primary/50 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success Criteria & Review */}
        {step === 4 && (
          <div className="space-y-3.5 text-xs font-semibold">
            <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 space-y-2">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Target Habit:</span>
                <strong className="text-foreground">{selectedHabit?.name || 'DSA Practice'}</strong>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Baseline Completion:</span>
                <strong className="text-foreground">{selectedHabit?.completionRate || 72}%</strong>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Target Success Rate:</span>
                <strong className="text-emerald-500 dark:text-emerald-400 font-mono text-sm">{targetValue}% (+8 pts)</strong>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Experiment Duration:</span>
                <div className="flex gap-1">
                  {[7, 14, 21, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDurationDays(d)}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer',
                        durationDays === d
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-elevated text-muted-foreground border-border hover:text-foreground'
                      )}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                Target Success Rate:
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-20 bg-surface-sunken border border-border rounded-lg px-2 py-1 text-xs font-bold text-foreground text-center"
              />
              <span className="text-xs text-muted-foreground font-bold">%</span>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLaunch}
              disabled={submitting}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              <Zap className="h-3.5 w-3.5 fill-white" />
              <span>Launch Experiment</span>
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
};
