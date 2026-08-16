import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Flame, CheckCircle, Target, Award } from 'lucide-react';
import { ThemeLogo } from '@/components/brand/ThemeLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

interface LastUserStats {
  name: string;
  streakDays: number;
  consistency: number;
  tasksCompleted: number;
  activeGoals: number;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const [lastUser, setLastUser] = useState<LastUserStats | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('daily_forge_last_user');
      if (saved) {
        setLastUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse cached user stats:', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface-sunken text-foreground flex flex-col lg:flex-row font-sans antialiased overflow-x-hidden selection:bg-primary/20">
      {/* Radial glow background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none z-0" />

      {/* Left/Form Column */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:max-w-2xl xl:max-w-3xl z-10">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
          <Link to="/" title="Daily Forge Home">
            <ThemeLogo variant="full" theme="auto" size="md" />
          </Link>
        </div>

        {/* Content Box */}
        <div className="my-auto py-8 max-w-md w-full mx-auto">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center sm:text-left text-[11px] text-muted-foreground/60 flex flex-col sm:flex-row items-center gap-4 justify-between pt-4 border-t border-border/10">
          <span>&copy; {new Date().getFullYear()} DailyForge Inc. All rights reserved.</span>
          <div className="flex gap-4 font-medium">
            <a href="#terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>

      {/* Right/Insight Column */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] bg-surface-sunken border-l border-border/10 p-10 flex-col justify-between relative overflow-hidden shrink-0">
        {/* Glow behind stats */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

        {/* Top decorative header */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-widest uppercase">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span>Intelligence Engine</span>
        </div>

        {/* Insight content */}
        <div className="my-auto space-y-8 relative z-10">
          {lastUser ? (
            // Returning User State
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-primary">WELCOME BACK, {lastUser.name.toUpperCase()}</span>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight">
                  Continue forging <br />
                  your best self.
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your consistency is your superpower. Review your current statistics from your last productive sessions below.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-card border border-border/10 rounded-xl p-4 space-y-1 hover:border-border/30 transition-colors shadow-sm">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-warning uppercase">
                    <Flame className="h-3.5 w-3.5 fill-warning" />
                    <span>Streak</span>
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">{lastUser.streakDays} days</div>
                  <div className="text-[10px] text-muted-foreground">Keep the momentum</div>
                </div>

                <div className="bg-card border border-border/10 rounded-xl p-4 space-y-1 hover:border-border/30 transition-colors shadow-sm">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Consistency</span>
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">{lastUser.consistency}%</div>
                  <div className="text-[10px] text-muted-foreground">Overall completion</div>
                </div>

                <div className="bg-card border border-border/10 rounded-xl p-4 space-y-1 hover:border-border/30 transition-colors shadow-sm">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase">
                    <Target className="h-3.5 w-3.5" />
                    <span>Completed</span>
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">{lastUser.tasksCompleted}</div>
                  <div className="text-[10px] text-muted-foreground">Tasks accomplished</div>
                </div>

                <div className="bg-card border border-border/10 rounded-xl p-4 space-y-1 hover:border-border/30 transition-colors shadow-sm">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase">
                    <Award className="h-3.5 w-3.5" />
                    <span>Goals Active</span>
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">{lastUser.activeGoals}</div>
                  <div className="text-[10px] text-muted-foreground">Target milestones</div>
                </div>
              </div>
            </div>
          ) : (
            // New User State / Marketing
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-primary">DAILY FORGE PHILOSOPHY</span>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight">
                  Your journey <br />
                  starts here.
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Turn your daily routines into visual, structured progress. Build consistency, discover schedule trends, and unlock AI insights.
                </p>
              </div>

              {/* Conceptual progress tracks */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground/80">
                    <span>Consistency</span>
                    <span className="text-[10px] font-bold text-primary">87%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground/80">
                    <span>Focus Alignment</span>
                    <span className="text-[10px] font-bold text-indigo-400">78%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground/80">
                    <span>Progress Target</span>
                    <span className="text-[10px] font-bold text-cyan-400">60%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Small branding text */}
        <div className="text-[10px] text-muted-foreground/40 font-mono tracking-wide">
          SYSTEM VERSION: V1.0.4 // AGENT-READY
        </div>
      </div>
    </div>
  );
};
