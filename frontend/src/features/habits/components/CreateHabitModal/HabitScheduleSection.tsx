import React from 'react';
import { HabitFrequency } from '@/types/habit';
import { Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HabitScheduleSectionProps {
  frequency: HabitFrequency;
  onChangeFrequency: (freq: HabitFrequency) => void;
  customDays: number[];
  onChangeCustomDays: (days: number[]) => void;
  preferredTime: string;
  onChangePreferredTime: (time: string) => void;
  timeWindowStart: string;
  onChangeTimeWindowStart: (val: string) => void;
  timeWindowEnd: string;
  onChangeTimeWindowEnd: (val: string) => void;
  isWindowFlexible: boolean;
  onToggleFlexibleWindow: (val: boolean) => void;
}

const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'weekends', label: 'Weekends (Sat–Sun)' },
  { value: 'specific_days', label: 'Specific Days' },
  { value: 'weekly', label: 'Weekly' },
];

const DAYS_OF_WEEK = [
  { dayIndex: 1, label: 'M', name: 'Monday' },
  { dayIndex: 2, label: 'T', name: 'Tuesday' },
  { dayIndex: 3, label: 'W', name: 'Wednesday' },
  { dayIndex: 4, label: 'T', name: 'Thursday' },
  { dayIndex: 5, label: 'F', name: 'Friday' },
  { dayIndex: 6, label: 'S', name: 'Saturday' },
  { dayIndex: 0, label: 'S', name: 'Sunday' },
];

export const HabitScheduleSection: React.FC<HabitScheduleSectionProps> = ({
  frequency,
  onChangeFrequency,
  customDays,
  onChangeCustomDays,
  preferredTime,
  onChangePreferredTime,
  timeWindowStart,
  onChangeTimeWindowStart,
  timeWindowEnd,
  onChangeTimeWindowEnd,
  isWindowFlexible,
  onToggleFlexibleWindow,
}) => {
  const toggleDay = (dayIndex: number) => {
    if (customDays.includes(dayIndex)) {
      onChangeCustomDays(customDays.filter((d) => d !== dayIndex));
    } else {
      onChangeCustomDays([...customDays, dayIndex].sort());
    }
  };

  return (
    <div className="space-y-4 text-left">
      {/* Frequency selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-foreground">Frequency</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FREQUENCY_OPTIONS.map((opt) => {
            const isSelected = frequency === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => onChangeFrequency(opt.value)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer select-none',
                  isSelected
                    ? 'bg-primary/15 border-primary text-primary shadow-sm'
                    : 'bg-surface-sunken/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Specific Days Picker */}
      {(frequency === 'specific_days' || frequency === 'custom') && (
        <div className="space-y-1.5 pt-1">
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Select Active Days
          </label>
          <div className="flex gap-2">
            {DAYS_OF_WEEK.map((d) => {
              const isSelected = customDays.includes(d.dayIndex);
              return (
                <button
                  type="button"
                  key={d.dayIndex}
                  onClick={() => toggleDay(d.dayIndex)}
                  title={d.name}
                  className={cn(
                    'h-9 w-9 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center cursor-pointer select-none',
                    isSelected
                      ? 'bg-primary border-primary text-white shadow-sm'
                      : 'bg-surface-sunken/40 border-border/70 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          {customDays.length === 0 && (
            <p className="text-[11px] text-warning font-medium">Please select at least 1 active day.</p>
          )}
        </div>
      )}

      {/* Preferred Time & Flexible Window */}
      <div className="space-y-3 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Preferred Time & Window</span>
          </label>
          <button
            type="button"
            onClick={() => onToggleFlexibleWindow(!isWindowFlexible)}
            className="text-[11px] text-primary hover:text-primary-hover font-bold cursor-pointer"
          >
            {isWindowFlexible ? 'Use Exact Time' : '+ Add Time Window'}
          </button>
        </div>

        {!isWindowFlexible ? (
          <div className="space-y-1">
            <input
              type="time"
              value={preferredTime}
              onChange={(e) => onChangePreferredTime(e.target.value)}
              className="w-full sm:w-48 rounded-xl border border-border bg-surface-sunken/60 px-3.5 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-[11px] text-muted-foreground">
              Used as your baseline to determine your optimal execution time.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Window Start</span>
                <input
                  type="time"
                  value={timeWindowStart}
                  onChange={(e) => onChangeTimeWindowStart(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-sunken/60 px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <span className="text-muted-foreground text-xs pt-4">to</span>
              <div className="flex-1 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Window End</span>
                <input
                  type="time"
                  value={timeWindowEnd}
                  onChange={(e) => onChangeTimeWindowEnd(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-sunken/60 px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Flexible window allows logging completions during optimal performance hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
