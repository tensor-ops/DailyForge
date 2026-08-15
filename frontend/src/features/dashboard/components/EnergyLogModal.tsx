import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { useToast } from '@/hooks/useToast';

interface EnergyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const EnergyLogModal: React.FC<EnergyLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { success, error } = useToast();
  const [energy, setEnergy] = useState(7);
  const [focus, setFocus] = useState(7);
  const [mood, setMood] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await analyticsService.logEnergy({ energy, focus, mood });
      success('Daily check-in saved! ✦', 'Your energy metrics have been indexed.');
      if (onSave) onSave();
      onClose();
    } catch (err) {
      error('Check-in failed', 'Unable to log energy metrics.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-sunken/85 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 border-b border-border/10 pb-3">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-base font-extrabold text-foreground">Daily Energy & Capacity Check-in</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Energy Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-foreground">Energy Level (1 - 10)</span>
              <span className="text-primary font-bold">{energy} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-[10px] text-muted-foreground leading-none">1 = Exhausted, 10 = Fully charged</p>
          </div>

          {/* Focus Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-foreground">Focus Capacity (1 - 10)</span>
              <span className="text-primary font-bold">{focus} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={focus}
              onChange={(e) => setFocus(Number(e.target.value))}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-[10px] text-muted-foreground leading-none">1 = Scattered, 10 = Deep state flow</p>
          </div>

          {/* Mood note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">Current Mood / Reflection</label>
            <input
              type="text"
              placeholder="e.g. motivated, tired but focused..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-surface-sunken border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary-hover text-foreground font-bold text-xs py-2.5 rounded-xl transition-all shadow-md mt-4 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Indexing...' : 'Save Check-in'}
          </button>
        </form>
      </div>
    </div>
  );
};
