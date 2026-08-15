import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/hooks/useToast';
import { Sparkles, Star, AlertTriangle, Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ForgeInsightsDashboardProps {
  behaviorData?: any;
}

export const ForgeInsightsDashboard: React.FC<ForgeInsightsDashboardProps> = ({ behaviorData }) => {
  const { success, info } = useToast();
  const [activeCategory, setActiveCategory] = useState<'all' | 'patterns' | 'recommendations' | 'risks' | 'relationships' | 'weekly'>('all');

  // Recommendation acceptance simulation
  const [showRec, setShowRec] = useState(true);

  // Insufficient data fallback
  const isDataInsufficient = behaviorData?.isBaselineBuilding;

  if (isDataInsufficient) {
    return (
      <div className="max-w-xl mx-auto py-12 text-left space-y-6 select-none">
        <div className="bg-[#101622] border border-[#1D293D] rounded-2xl p-6 flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl border border-primary/20 animate-pulse">
            🧠
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-100">Still learning your patterns.</h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Keep checking off your routines. Once Daily Forge observes enough daily habit logs, correlation maps and recommendations will populate.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Forge Insights"
        description="Patterns discovered from your behavior."
      />

      {/* Category filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-bold text-xs">
        {([
          { id: 'all', label: 'All Insights' },
          { id: 'patterns', label: 'Patterns' },
          { id: 'recommendations', label: 'Recommendations' },
          { id: 'risks', label: 'Risks' },
          { id: 'relationships', label: 'Relationships' },
          { id: 'weekly', label: 'Weekly Review' },
        ] as const).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg transition-all cursor-pointer border',
              activeCategory === cat.id
                ? 'bg-primary border-primary text-slate-100'
                : 'bg-[#101622] border-[#1D293D] text-muted-foreground hover:text-foreground'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column main insights */}
        <div className="lg:col-span-2 space-y-5">
          {/* Featured Insight */}
          {(activeCategory === 'all' || activeCategory === 'patterns') && (
            <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
              <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span>Featured Insight</span>
              </div>
              <div className="space-y-1.5 text-left">
                <h3 className="text-base font-extrabold text-slate-100">YOUR EVENING ADVANTAGE</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  Your habit completion is <strong className="text-primary font-bold">18% higher</strong> between 7–9 PM than 3–5 PM.
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold">Based on 42 comparable sessions.</p>
              </div>
              <button
                onClick={() => info('Insight metrics', 'Calculated based on evening completions vs afternoon logs.')}
                className="text-primary hover:text-primary-hover text-xs font-bold w-max cursor-pointer focus:outline-none"
              >
                Why am I seeing this?
              </button>
            </Card>
          )}

          {/* Keystone Habits */}
          {(activeCategory === 'all' || activeCategory === 'relationships') && (
            <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Keystone Habit Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Routines that trigger compounding positive returns</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
                <div className="p-3 bg-[#131B29] border border-border/5 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block">Keystone Routine</span>
                  <span className="text-slate-100 font-extrabold">Exercise</span>
                </div>
                <div className="p-3 bg-[#131B29] border border-border/5 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block font-bold">Completions</span>
                  <span className="text-success">24 logged</span>
                </div>
                <div className="p-3 bg-[#131B29] border border-border/5 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block font-bold">Avg daily completion</span>
                  <span className="text-success">92%</span>
                </div>
                <div className="p-3 bg-[#131B29] border border-border/5 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block font-bold">Association multiplier</span>
                  <span className="text-primary">+21 points on supporting routines</span>
                </div>
              </div>
            </Card>
          )}

          {/* Weekly review list */}
          {(activeCategory === 'all' || activeCategory === 'weekly') && (
            <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Weekly Review Summary</h3>
              <div className="space-y-3 text-xs font-semibold text-slate-300 text-left">
                <div>
                  <span className="text-[10px] text-success block font-bold uppercase">Wins</span>
                  <p className="text-slate-200">Maintained morning routine streak of 5+ days.</p>
                </div>
                <div>
                  <span className="text-[10px] text-warning block font-bold uppercase">Challenges</span>
                  <p className="text-slate-200">Experienced focus friction during afternoon coding blocks.</p>
                </div>
                <div>
                  <span className="text-[10px] text-primary block font-bold uppercase">Recommendations</span>
                  <p className="text-slate-200">Postpone Reading to 8:30 PM to avoid scheduling overlaps.</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right side decline alerts & recommendations */}
        <div className="space-y-5">
          {/* Habit Risks */}
          {(activeCategory === 'all' || activeCategory === 'risks') && (
            <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-border/10 pb-2">
                <AlertTriangle className="h-4.5 w-4.5 text-warning animate-pulse" />
                <h3 className="text-xs font-bold text-warning uppercase tracking-wider">Habit Risks</h3>
              </div>
              
              <div className="space-y-3 text-xs font-semibold text-slate-300 text-left">
                <div className="p-3 bg-[#131B29] border border-border/5 rounded-xl">
                  <h4 className="text-slate-100 font-extrabold">DSA Practice</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Current</span>
                      <span>71%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Baseline</span>
                      <span>86%</span>
                    </div>
                  </div>
                  <span className="inline-block mt-2.5 px-2 py-0.5 bg-danger/10 text-danger border border-danger/20 rounded text-[9px] font-bold">
                    DECLINING
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Recommendations checklist */}
          {(activeCategory === 'all' || activeCategory === 'recommendations') && showRec && (
            <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-border/10 pb-2">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Recommendation</h3>
              </div>

              <div className="text-left space-y-2 text-xs font-semibold">
                <h4 className="text-slate-200 font-bold">Move Reading → 8:30 PM</h4>
                <p className="text-[10px] text-muted-foreground font-medium">Reason: Higher historical completion success.</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => {
                    success('Schedule updated!', 'Reading shifted to 8:30 PM.');
                    setShowRec(false);
                  }}
                  className="flex-1 bg-success/15 border border-success/20 text-success hover:bg-success/25 py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => setShowRec(false)}
                  className="flex-1 bg-muted hover:bg-[#151D2C] text-muted-foreground py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors border border-white/5"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Dismiss</span>
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
