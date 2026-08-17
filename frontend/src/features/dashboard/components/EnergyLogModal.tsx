import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { useToast } from '@/hooks/useToast';
import { Dialog } from '@/components/dialogs/Dialog';
import { Button } from '@/components/ui/Button';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await analyticsService.logEnergy({ energy, focus, mood });
      success('Daily check-in saved! ✦', 'Your energy metrics have been indexed.');
      if (onSave) onSave();
      onClose();
    } catch {
      error('Check-in failed', 'Unable to log energy metrics.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Energy & Capacity Check-in"
      description="Track cognitive and physical energy levels to optimize scheduling"
      icon={Sparkles}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
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
            className="w-full accent-primary bg-surface-sunken h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Exhausted</span>
            <span>Optimal</span>
            <span>Peak</span>
          </div>
        </div>

        {/* Focus Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-foreground">Mental Focus & Clarity (1 - 10)</span>
            <span className="text-primary font-bold">{focus} / 10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={focus}
            onChange={(e) => setFocus(Number(e.target.value))}
            className="w-full accent-primary bg-surface-sunken h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Brain Fog</span>
            <span>Focused</span>
            <span>Laser Flow</span>
          </div>
        </div>

        {/* Mood Tag */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground block">
            Subjective State / Context (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Slept 8 hours, coffee kicked in, feeling driven"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full text-xs font-medium bg-surface-sunken border border-border rounded-xl px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? 'Saving...' : 'Save Check-in'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
