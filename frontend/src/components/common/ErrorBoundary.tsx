import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-md w-full p-8 rounded-panel border border-danger/20 bg-card text-center shadow-popover">
            <div className="h-14 w-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The application encountered an unexpected runtime error. We have safeguarded your state.
            </p>
            <Button
              onClick={this.handleReload}
              variant="primary"
              className="w-full"
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
