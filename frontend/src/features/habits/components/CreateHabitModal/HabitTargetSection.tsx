import React, { useState } from 'react';
import { TrackingType } from '@/types/habit';
import { CheckSquare, Timer, Hash, Layers, ListChecks, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HabitTargetSectionProps {
  trackingType: TrackingType;
  onChangeTrackingType: (type: TrackingType) => void;
  targetValue: number;
  onChangeTargetValue: (val: number) => void;
  targetUnit: string;
  onChangeTargetUnit: (unit: string) => void;
  checklistItems: string[];
  onChangeChecklistItems: (items: string[]) => void;
}

const TRACKING_OPTIONS: {
  type: TrackingType;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultUnit: string;
  defaultValue: number;
}[] = [
  {
    type: 'binary',
    label: 'Binary',
    desc: 'Completed or Not completed',
    icon: CheckSquare,
    defaultUnit: 'times',
    defaultValue: 1,
  },
  {
    type: 'duration',
    label: 'Duration',
    desc: 'Measure time spent (e.g. 45 mins)',
    icon: Timer,
    defaultUnit: 'minutes',
    defaultValue: 30,
  },
  {
    type: 'count',
    label: 'Count',
    desc: 'Repetitions / sets (e.g. 20 reps)',
    icon: Hash,
    defaultUnit: 'reps',
    defaultValue: 20,
  },
  {
    type: 'quantity',
    label: 'Quantity',
    desc: 'Target volume (e.g. 8 glasses)',
    icon: Layers,
    defaultUnit: 'glasses',
    defaultValue: 8,
  },
  {
    type: 'checklist',
    label: 'Checklist',
    desc: 'Multi-step routine (e.g. 3 tasks)',
    icon: ListChecks,
    defaultUnit: 'steps',
    defaultValue: 1,
  },
];

export const HabitTargetSection: React.FC<HabitTargetSectionProps> = ({
  trackingType,
  onChangeTrackingType,
  targetValue,
  onChangeTargetValue,
  targetUnit,
  onChangeTargetUnit,
  checklistItems,
  onChangeChecklistItems,
}) => {
  const [newChecklistText, setNewChecklistText] = useState('');

  const handleSelectType = (opt: (typeof TRACKING_OPTIONS)[number]) => {
    onChangeTrackingType(opt.type);
    onChangeTargetUnit(opt.defaultUnit);
    onChangeTargetValue(opt.defaultValue);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    onChangeChecklistItems([...checklistItems, newChecklistText.trim()]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (index: number) => {
    onChangeChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 text-left">
      {/* Tracking Type Grid */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-foreground">Tracking Method</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TRACKING_OPTIONS.map((opt) => {
            const isSelected = trackingType === opt.type;
            const Icon = opt.icon;
            return (
              <button
                type="button"
                key={opt.type}
                onClick={() => handleSelectType(opt)}
                className={cn(
                  'flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer select-none',
                  isSelected
                    ? 'bg-primary/15 border-primary text-primary shadow-sm'
                    : 'bg-surface-sunken/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                )}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{opt.label}</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target configuration depending on type */}
      {trackingType !== 'binary' && trackingType !== 'checklist' && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Target Value
            </label>
            <input
              type="number"
              min={1}
              value={targetValue}
              onChange={(e) => onChangeTargetValue(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl border border-border bg-surface-sunken/60 px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Unit
            </label>
            <input
              type="text"
              value={targetUnit}
              onChange={(e) => onChangeTargetUnit(e.target.value)}
              placeholder="e.g., minutes, pages, reps"
              className="w-full rounded-xl border border-border bg-surface-sunken/60 px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      )}

      {/* Checklist items editor */}
      {trackingType === 'checklist' && (
        <div className="space-y-2 pt-1">
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Checklist Steps
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
              placeholder="Add a step (e.g. 5m Meditation)..."
              className="flex-1 rounded-xl border border-border bg-surface-sunken/60 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="px-3 py-1.5 bg-surface-elevated hover:bg-muted border border-border rounded-xl text-xs font-bold text-foreground flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>

          {checklistItems.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface-sunken/80 border border-border/60 text-xs"
                >
                  <span className="font-medium text-foreground">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(idx)}
                    className="text-muted-foreground hover:text-danger p-1 rounded transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
