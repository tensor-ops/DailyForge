import React from 'react';
import { Button } from '@/components/ui/Button';
import { Sparkles, AlertCircle, CheckCircle2, Inbox } from 'lucide-react';

interface DialogLoadingViewProps {
  title?: string;
  subtitle?: string;
  isAi?: boolean;
}

export const DialogLoadingView: React.FC<DialogLoadingViewProps> = ({
  title = 'Loading...',
  subtitle = 'Fetching data from DailyForge engine...',
  isAi = false,
}) => {
  return (
    <div className="py-12 text-center space-y-3">
      <div className="relative h-10 w-10 mx-auto">
        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        {isAi && (
          <Sparkles className="h-4 w-4 text-primary absolute inset-0 m-auto animate-pulse" />
        )}
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-extrabold text-foreground">{title}</h4>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
};

interface DialogErrorViewProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const DialogErrorView: React.FC<DialogErrorViewProps> = ({
  title = 'Action Failed',
  message,
  onRetry,
}) => {
  return (
    <div className="py-8 text-center space-y-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
      <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
      <div className="space-y-1">
        <h4 className="text-xs font-extrabold text-rose-300">{title}</h4>
        <p className="text-[11px] text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

interface DialogSuccessViewProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  details?: React.ReactNode;
}

export const DialogSuccessView: React.FC<DialogSuccessViewProps> = ({
  title,
  subtitle,
  actionLabel = 'Done',
  onAction,
  details,
}) => {
  return (
    <div className="py-6 text-center space-y-4">
      <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">{subtitle}</p>
        )}
      </div>
      {details && <div className="text-left">{details}</div>}
      {onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

interface DialogEmptyViewProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export const DialogEmptyView: React.FC<DialogEmptyViewProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) => {
  return (
    <div className="py-10 text-center space-y-3 p-4 rounded-2xl bg-surface-sunken border border-border/70">
      <Icon className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
      <div className="space-y-1">
        <h4 className="text-xs font-extrabold text-foreground">{title}</h4>
        <p className="text-[11px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {onAction && actionLabel && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
