import React from 'react';
import { Card } from '@/components/ui/Card';
import { Sparkles, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface NextBestActionProps {
  capacityScore?: number;
  capacityHours?: number;
  incompleteHabits?: Array<{ id: string; name: string; category: string; bestTime?: string }>;
}

export const NextBestAction: React.FC<NextBestActionProps> = ({
  capacityScore = 70,
  capacityHours = 4.2,
  incompleteHabits = [],
}) => {
  const isOverloaded = capacityHours < 3.8;

  const defaultActions = [
    { id: '1', title: 'DSA Practice', reason: 'High impact', bestTime: '7:30 PM', number: '01' },
    { id: '2', title: 'Exercise', reason: 'Habit at risk', bestTime: '8:00 AM', number: '02' },
    { id: '3', title: 'Reading', reason: '15-minute target recommended', bestTime: '9:00 PM', number: '03' },
  ];

  const actions = incompleteHabits.length > 0
    ? incompleteHabits.slice(0, 3).map((h, i) => ({
        id: h.id,
        title: h.name,
        reason: i === 0 ? 'High impact routine' : i === 1 ? 'Best recovery target' : 'Maintain consistency',
        bestTime: h.bestTime || 'Anytime',
        number: `0${i + 1}`,
      }))
    : defaultActions;

  return (
    <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Next Best Action</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Today&apos;s intelligent priorities</p>
        </div>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
          AI Suggestion
        </span>
      </div>

      {/* Workload Capacity alert bar */}
      <div className={cn(
        "p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold select-none",
        isOverloaded
          ? "bg-warning/10 border-warning/20 text-warning"
          : "bg-primary/5 border-primary/10 text-slate-200"
      )}>
        {isOverloaded ? (
          <>
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <div>
              <p className="font-bold">Workload capacity overloaded</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Today&apos;s plan exceeds your recent capacity. Move Reading to tomorrow?</p>
            </div>
          </>
        ) : (
          <>
            <Sparkles className="h-4.5 w-4.5 text-primary shrink-0 animate-pulse" />
            <div>
              <p className="font-bold">Focus Capacity: {capacityHours}h available ({capacityScore} capacity score)</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Workload: 3.6h (Habits 2.1h, Goals 1.5h). Balanced.</p>
            </div>
          </>
        )}
      </div>

      {/* Actions priority list */}
      <div className="space-y-3">
        {actions.map((act) => (
          <div key={act.id} className="flex items-center gap-3.5 p-3 rounded-xl border border-border/5 bg-[#131B29] hover:border-border/15 transition-all">
            <span className="text-lg font-black text-muted-foreground/35 select-none">{act.number}</span>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-extrabold text-slate-200 leading-none truncate">{act.title}</h4>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">{act.reason}</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-muted px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 border border-white/5">
              <Calendar className="h-3 w-3 text-primary shrink-0" />
              <span>{act.bestTime}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
