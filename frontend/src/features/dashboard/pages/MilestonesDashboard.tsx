import React from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Trophy, Award, Sparkles, Flame, Clock } from 'lucide-react';

export const MilestonesDashboard: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Milestones"
        description="Progress worth remembering."
      />

      {/* Personal Records Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Longest Streak"
          value="34 Days"
          subtext="Consecutive logins"
          icon={Flame}
          accent="orange"
        />
        <MetricCard
          title="Best Week"
          value="94%"
          subtext="Record completion rate"
          icon={Trophy}
          accent="blue"
        />
        <MetricCard
          title="Highest Forge Score"
          value="812"
          subtext="Record behavior index"
          icon={Sparkles}
          accent="blue"
        />
        <MetricCard
          title="Best Recovery"
          value="1 Day"
          subtext="Record skip gap return"
          icon={Clock}
          accent="green"
        />
      </div>

      {/* Main split grid: achievements vs timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left achievements grid */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Completed Achievements</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
              <div className="p-3 bg-surface-elevated border border-border/5 rounded-xl text-left flex items-start gap-2.5">
                <Award className="h-5 w-5 text-success shrink-0" />
                <div>
                  <h4 className="text-foreground font-bold leading-none">30-Day Consistency</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">Maintained consistency above 85%</p>
                </div>
              </div>
              <div className="p-3 bg-surface-elevated border border-border/5 rounded-xl text-left flex items-start gap-2.5">
                <Award className="h-5 w-5 text-success shrink-0" />
                <div>
                  <h4 className="text-foreground font-bold leading-none">100 Hours Learning</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">Logged study and practice sessions</p>
                </div>
              </div>
              <div className="p-3 bg-surface-elevated border border-border/5 rounded-xl text-left flex items-start gap-2.5">
                <Award className="h-5 w-5 text-success shrink-0" />
                <div>
                  <h4 className="text-foreground font-bold leading-none">50 Workouts Complete</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">Established fitness habits</p>
                </div>
              </div>
              <div className="p-3 bg-surface-elevated border border-border/5 rounded-xl text-left flex items-start gap-2.5">
                <Award className="h-5 w-5 text-success shrink-0" />
                <div>
                  <h4 className="text-foreground font-bold leading-none">First Goal Complete</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">Paced and finished a roadmap target</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Milestones Timeline */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Milestones</h3>
            <div className="space-y-4 relative border-l border-border/60 pl-4 ml-1">
              {[
                { date: 'August 12', event: 'Reached 800+ Forge Score', desc: 'Consistency index reached 91%' },
                { date: 'August 08', event: 'Completed ML Roadmap Milestone', desc: 'Milestone 2 pacing finished ahead of date' },
                { date: 'August 02', event: '20-day streak unlocked', desc: 'Mindfulness habit consecutive completed' },
              ].map((item, idx) => (
                <div key={idx} className="relative group text-xs font-semibold text-left">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-primary bg-surface-sunken" />
                  <div>
                    <span className="text-[10px] text-primary font-bold">{item.date}</span>
                    <h4 className="text-foreground font-bold leading-none mt-0.5">{item.event}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right next targets column */}
        <div className="space-y-5">
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-border/10 pb-2">
              <Trophy className="h-4.5 w-4.5 text-primary" />
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Next Milestones</h3>
            </div>
            
            <div className="space-y-4 text-xs font-semibold text-slate-300">
              <div className="space-y-1 text-left">
                <div className="flex justify-between">
                  <span>90-Day Consistency</span>
                  <span className="text-muted-foreground">12 / 30 days</span>
                </div>
                <ProgressBar value={(12 / 30) * 100} accent="blue" />
              </div>
              <div className="space-y-1 text-left">
                <div className="flex justify-between">
                  <span>100 Study sessions</span>
                  <span className="text-muted-foreground">23 / 50 sessions</span>
                </div>
                <ProgressBar value={(23 / 50) * 100} accent="green" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
