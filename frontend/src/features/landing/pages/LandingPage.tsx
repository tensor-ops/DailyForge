import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Bot,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 glass-nav border-b border-border/80 px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary via-indigo-500 to-ai text-white flex items-center justify-center shadow-ai-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">HABITI</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Open App
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Glow background accent */}
        <div className="absolute top-10 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
        <div className="absolute top-32 -z-10 h-72 w-72 rounded-full bg-ai/20 blur-[120px] pointer-events-none" />

        <Badge variant="ai" className="mb-6 px-3 py-1 text-xs">
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          AI Habit Intelligence Engine v2.0
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl leading-[1.15] mb-6">
          Build Better Habits. <br />
          <span className="ai-gradient-text">Understand Yourself.</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
          Track daily routines, maintain streaks, visualize consistency, and leverage neural AI insights to unlock long-term behavioral transformation.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/dashboard')}
            rightIcon={<ArrowRight className="h-5 w-5" />}
            className="w-full sm:w-auto shadow-elevated"
          >
            Start Tracking Free
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
          >
            Explore Live Demo
          </Button>
        </div>

        {/* Live Interactive Product Mock Preview */}
        <div className="mt-14 w-full p-2 sm:p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-popover">
          <div className="rounded-xl border border-border/60 bg-surface-sunken p-4 sm:p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-danger/80" />
                <span className="h-3 w-3 rounded-full bg-warning/80" />
                <span className="h-3 w-3 rounded-full bg-success/80" />
              </div>
              <span className="text-xs font-mono text-muted-foreground">app.habiti.ai/dashboard</span>
              <Badge variant="success" size="sm">🔥 14-Day Streak</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <Card className="p-4 bg-card">
                <div className="text-xs font-medium text-muted-foreground uppercase">Today&apos;s Score</div>
                <div className="text-2xl font-bold text-foreground mt-1">87%</div>
                <div className="text-xs text-success flex items-center gap-1 mt-1 font-medium">
                  +12% vs last week
                </div>
              </Card>
              <Card className="p-4 bg-card">
                <div className="text-xs font-medium text-muted-foreground uppercase">Active Routines</div>
                <div className="text-2xl font-bold text-foreground mt-1">6 Habits</div>
                <div className="text-xs text-muted-foreground mt-1">4 completed today</div>
              </Card>
              <Card variant="ai" className="p-4 bg-card">
                <div className="text-xs font-medium text-ai uppercase flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI Insight
                </div>
                <div className="text-xs text-foreground mt-1 font-medium">
                  Morning workouts yield 34% higher completion.
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Grid */}
      <section className="py-16 px-6 bg-surface/50 border-t border-border/60">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Engineered for Behavioral Consistency
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Built on behavioral psychology and atomic habit loops: Track &rarr; Understand &rarr; Improve &rarr; Repeat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3 hover:border-primary/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Frictionless Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Log routines with one tap. Support for daily, weekday, and target-based habits with customizable reminders.
              </p>
            </Card>

            <Card className="p-6 space-y-3 hover:border-ai/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-ai/10 text-ai flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Neural AI Coach</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Detect hidden friction points, identify peak energy windows, and chat directly with your personal behavioral coach.
              </p>
            </Card>

            <Card className="p-6 space-y-3 hover:border-warning/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Deep Analytics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Rich consistency trends, category heatmaps, and weekly momentum comparisons to keep you in the zone.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} HABITI AI. Engineered for peak human potential.</p>
      </footer>
    </div>
  );
};
