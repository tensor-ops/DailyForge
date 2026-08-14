import React from 'react';
import { cn } from '@/utils/cn';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Sparkles, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'ai';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-danger shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning shrink-0" />,
    info: <Info className="h-5 w-5 text-info shrink-0" />,
    ai: <Sparkles className="h-5 w-5 text-ai shrink-0" />,
  };

  const borders = {
    success: 'border-success/30',
    error: 'border-danger/30',
    warning: 'border-warning/30',
    info: 'border-info/30',
    ai: 'border-ai/40 shadow-ai-glow',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 w-full max-w-sm rounded-xl p-4 bg-card/95 backdrop-blur-md border shadow-elevated transition-all animate-slide-in-right',
        borders[toast.type]
      )}
      role="alert"
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground tracking-tight">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
