import React from 'react';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  label: string;
  description?: string;
}

interface DialogStepIndicatorProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export const DialogStepIndicator: React.FC<DialogStepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isUpcoming = currentStep < step.id;

        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              disabled={!onStepClick || isUpcoming}
              onClick={() => onStepClick?.(step.id)}
              className={cn(
                'flex items-center gap-2 group text-left cursor-default transition-all',
                onStepClick && !isUpcoming && 'cursor-pointer hover:opacity-80'
              )}
            >
              <div
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all',
                  isCompleted && 'bg-emerald-500 text-white shadow-sm',
                  isCurrent && 'bg-primary text-white ring-2 ring-primary/30',
                  isUpcoming && 'bg-surface-sunken text-muted-foreground border border-border/80'
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
              </div>
              <div className="hidden sm:block">
                <span
                  className={cn(
                    'text-[11px] font-bold block uppercase tracking-wider',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
            </button>

            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-[2px] rounded-full transition-all',
                  currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-border/60'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
