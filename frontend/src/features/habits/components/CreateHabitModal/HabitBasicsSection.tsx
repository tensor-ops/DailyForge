import React from 'react';
import { HabitCategory } from '@/types/habit';
import { cn } from '@/utils/cn';

interface HabitBasicsSectionProps {
  name: string;
  onChangeName: (val: string) => void;
  category: HabitCategory;
  onChangeCategory: (cat: HabitCategory) => void;
  description: string;
  onChangeDescription: (val: string) => void;
  errorName?: string;
}

export const CATEGORY_OPTIONS: { category: HabitCategory; icon: string; label: string }[] = [
  { category: 'Health', icon: '💧', label: 'Health' },
  { category: 'Fitness', icon: '⚡', label: 'Fitness' },
  { category: 'Study', icon: '🧠', label: 'Study' },
  { category: 'Work', icon: '💼', label: 'Work' },
  { category: 'Personal', icon: '📖', label: 'Personal' },
  { category: 'Finance', icon: '💰', label: 'Finance' },
  { category: 'Mindfulness', icon: '✨', label: 'Mindfulness' },
  { category: 'Creativity', icon: '🎨', label: 'Creativity' },
  { category: 'Other', icon: '🎯', label: 'Other' },
];

export const HabitBasicsSection: React.FC<HabitBasicsSectionProps> = ({
  name,
  onChangeName,
  category,
  onChangeCategory,
  description,
  onChangeDescription,
  errorName,
}) => {
  return (
    <div className="space-y-4 text-left">
      {/* Habit Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-foreground">
          Habit Name <span className="text-primary">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="e.g., Morning 20m Yoga & Mobility"
          maxLength={100}
          className={cn(
            'w-full rounded-xl border bg-surface-sunken/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            errorName ? 'border-danger focus:ring-danger/50' : 'border-border'
          )}
          autoFocus
        />
        {errorName && <p className="text-[11px] text-danger font-semibold">{errorName}</p>}
      </div>

      {/* Category Pills */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-foreground">Category</label>
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
          {CATEGORY_OPTIONS.map((opt) => {
            const isSelected = category === opt.category;
            return (
              <button
                type="button"
                key={opt.category}
                onClick={() => onChangeCategory(opt.category)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer select-none',
                  isSelected
                    ? 'bg-primary/15 border-primary text-primary shadow-sm'
                    : 'bg-surface-sunken/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                )}
              >
                <span>{opt.icon}</span>
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description / Motivation */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-foreground">
            Description / Motivation <span className="text-muted-foreground font-normal">(Optional)</span>
          </label>
          <span className="text-[10px] text-muted-foreground font-mono">{description.length}/500</span>
        </div>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder="Why does this habit matter to you? e.g., Start with sun salutations to elevate focus."
          maxLength={500}
          className="w-full rounded-xl border border-border bg-surface-sunken/60 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
        />
      </div>
    </div>
  );
};
