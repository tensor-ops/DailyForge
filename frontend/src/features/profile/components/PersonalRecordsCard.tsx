import React from 'react';
import { Card } from '@/components/ui/Card';
import { PersonalRecordsData } from '@/types/profile';
import { Trophy, Flame, Zap, CheckCircle2, RotateCcw, Calendar } from 'lucide-react';

interface PersonalRecordsCardProps {
  records: PersonalRecordsData;
}

export const PersonalRecordsCard: React.FC<PersonalRecordsCardProps> = ({ records }) => {
  const items = [
    {
      icon: Flame,
      color: 'text-warning bg-warning/10 border-warning/20',
      label: records.longestStreak.label,
      value: records.longestStreak.value,
      date: records.longestStreak.date,
    },
    {
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      label: records.bestCompletionWeek.label,
      value: records.bestCompletionWeek.value,
      date: records.bestCompletionWeek.date,
    },
    {
      icon: Zap,
      color: 'text-primary bg-primary/10 border-primary/20',
      label: records.highestForgeScore.label,
      value: records.highestForgeScore.value,
      date: records.highestForgeScore.date,
    },
    {
      icon: Calendar,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      label: records.mostCompletedDay.label,
      value: records.mostCompletedDay.value,
      date: records.mostCompletedDay.date,
    },
    {
      icon: Trophy,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      label: records.totalCompletions.label,
      value: records.totalCompletions.value,
      date: records.totalCompletions.date,
    },
    {
      icon: RotateCcw,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      label: records.bestRecovery.label,
      value: records.bestRecovery.value,
      date: records.bestRecovery.date,
    },
  ];

  return (
    <Card className="p-6 bg-surface-elevated border-border shadow-card space-y-5">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Personal Records
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your highest historical performance milestones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-4 rounded-xl bg-surface border border-border/70 flex items-center gap-3.5 hover:border-border-strong transition-colors"
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 truncate">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                  {item.label}
                </span>
                <span className="text-base font-black text-foreground block tracking-tight">
                  {item.value}
                </span>
                <span className="text-[10px] text-muted-foreground/80 block">
                  {item.date}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
