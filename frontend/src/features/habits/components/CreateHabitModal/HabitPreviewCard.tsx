import React from 'react';
import { HabitCategory, HabitFrequency, TrackingType, DifficultyLevel } from '@/types/habit';
import { CATEGORY_OPTIONS } from './HabitBasicsSection';
import { Clock, Target, Bell, Zap } from 'lucide-react';

interface HabitPreviewCardProps {
  name: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  customDays: number[];
  preferredTime: string;
  trackingType: TrackingType;
  targetValue: number;
  targetUnit: string;
  reminderEnabled: boolean;
  reminderTime: string;
  difficulty: DifficultyLevel;
}

export const HabitPreviewCard: React.FC<HabitPreviewCardProps> = ({
  name,
  category,
  frequency,
  customDays,
  preferredTime,
  trackingType,
  targetValue,
  targetUnit,
  reminderEnabled,
  reminderTime,
  difficulty,
}) => {
  const catObj = CATEGORY_OPTIONS.find((c) => c.category === category) || CATEGORY_OPTIONS[0];

  const getFrequencyLabel = () => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekdays':
        return 'Weekdays (Mon–Fri)';
      case 'weekends':
        return 'Weekends (Sat–Sun)';
      case 'specific_days': {
        const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return customDays.map((d) => dayMap[d]).join(', ') || 'Specific Days';
      }
      case 'weekly':
        return 'Weekly';
      default:
        return 'Daily';
    }
  };

  const getTargetText = () => {
    if (trackingType === 'binary') return 'Done / Not Done';
    if (trackingType === 'checklist') return 'Complete all checklist steps';
    return `${targetValue} ${targetUnit}`;
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-surface-elevated/70 p-4 text-left space-y-3 shadow-sm motion-safe:animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Live Routine Preview</span>
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
          {catObj.icon} {category}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <div className="text-2xl p-2 rounded-xl bg-surface-sunken border border-border shrink-0">
          {catObj.icon}
        </div>
        <div className="space-y-1 min-w-0">
          <h4 className="text-sm font-extrabold text-foreground leading-snug truncate">
            {name.trim() || 'Untitled Habit'}
          </h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3 text-primary" />
              <span>
                {getFrequencyLabel()} {preferredTime && `· ${preferredTime}`}
              </span>
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Target className="h-3 w-3 text-emerald-500" />
              <span>{getTargetText()}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground font-medium">
        <span className="flex items-center gap-1">
          <Bell className="h-3 w-3 text-muted-foreground" />
          <span>{reminderEnabled ? `Reminders at ${reminderTime || 'Preferred Time'}` : 'Reminders off'}</span>
        </span>
        <span className="flex items-center gap-1 capitalize">
          <Zap className="h-3 w-3 text-amber-500" />
          <span>{difficulty} difficulty</span>
        </span>
      </div>
    </div>
  );
};
