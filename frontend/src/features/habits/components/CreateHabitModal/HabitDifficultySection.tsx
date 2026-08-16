import React from 'react';
import { DifficultyLevel, FrictionLevel } from '@/types/habit';
import { ShieldCheck, Zap, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HabitDifficultySectionProps {
  difficulty: DifficultyLevel;
  onChangeDifficulty: (diff: DifficultyLevel) => void;
  expectedFriction: FrictionLevel;
  onChangeExpectedFriction: (friction: FrictionLevel) => void;
}

const DIFFICULTY_OPTIONS: {
  value: DifficultyLevel;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    value: 'easy',
    label: 'Easy',
    desc: 'Low effort, quick win (e.g. 2m water)',
    icon: ShieldCheck,
    color: 'text-emerald-500',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    desc: 'Noticeable effort, steady flow',
    icon: Zap,
    color: 'text-blue-500',
  },
  {
    value: 'challenging',
    label: 'Challenging',
    desc: 'High willpower, deep focus required',
    icon: AlertTriangle,
    color: 'text-amber-500',
  },
];

const FRICTION_OPTIONS: { value: FrictionLevel; label: string }[] = [
  { value: 'low', label: 'Low Friction' },
  { value: 'medium', label: 'Medium Friction' },
  { value: 'high', label: 'High Friction' },
];

export const HabitDifficultySection: React.FC<HabitDifficultySectionProps> = ({
  difficulty,
  onChangeDifficulty,
  expectedFriction,
  onChangeExpectedFriction,
}) => {
  return (
    <div className="space-y-4 text-left">
      {/* Perceived Difficulty */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-foreground">How difficult does this habit feel?</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {DIFFICULTY_OPTIONS.map((opt) => {
            const isSelected = difficulty === opt.value;
            const Icon = opt.icon;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => onChangeDifficulty(opt.value)}
                className={cn(
                  'flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer select-none',
                  isSelected
                    ? 'bg-primary/15 border-primary text-primary shadow-sm'
                    : 'bg-surface-sunken/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isSelected ? 'text-primary' : opt.color)} />
                <div>
                  <div className="text-xs font-bold text-foreground">{opt.label}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expected Friction */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Expected Resistance / Friction
        </label>
        <div className="flex gap-2">
          {FRICTION_OPTIONS.map((opt) => {
            const isSelected = expectedFriction === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => onChangeExpectedFriction(opt.value)}
                className={cn(
                  'flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer select-none',
                  isSelected
                    ? 'bg-primary/15 border-primary text-primary shadow-sm'
                    : 'bg-surface-sunken/40 border-border/70 text-muted-foreground hover:text-foreground'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Educational Note */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-surface-sunken/60 border border-border/60 text-[11px] text-muted-foreground leading-relaxed">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          Daily Forge compares your initial difficulty expectation against real completion behavior to compute true behavioral friction and stability risk.
        </p>
      </div>
    </div>
  );
};
