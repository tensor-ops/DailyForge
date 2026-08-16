import React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HabitRemindersSectionProps {
  reminderEnabled: boolean;
  onToggleReminder: (enabled: boolean) => void;
  reminderTime: string;
  onChangeReminderTime: (time: string) => void;
}

export const HabitRemindersSection: React.FC<HabitRemindersSectionProps> = ({
  reminderEnabled,
  onToggleReminder,
  reminderTime,
  onChangeReminderTime,
}) => {
  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-sunken/40 border border-border/70">
        <div className="flex items-center gap-2.5">
          <div className={cn('p-2 rounded-lg', reminderEnabled ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Push Notifications & Reminders</h4>
            <p className="text-[11px] text-muted-foreground">Receive a timely nudge to protect your daily streak</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleReminder(!reminderEnabled)}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50',
            reminderEnabled ? 'bg-primary' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
              reminderEnabled ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {reminderEnabled && (
        <div className="space-y-1.5 pl-1 motion-safe:animate-fade-in">
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Reminder Time
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => onChangeReminderTime(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-border bg-surface-sunken/60 px-3.5 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}
    </div>
  );
};
