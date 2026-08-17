import React from 'react';
import { Card } from '@/components/ui/Card';
import { PersonalRecordItem } from '@/types/profile';
import { Trophy, Flame, Zap, CheckCircle2, RotateCcw, Calendar, Award } from 'lucide-react';

interface PersonalRecordsCardProps {
  records: PersonalRecordItem[] | Record<string, any>;
}

const getRecordIcon = (label: string, iconName?: string) => {
  const str = (label + ' ' + (iconName || '')).toLowerCase();
  if (str.includes('streak') || str.includes('flame')) {
    return { icon: Flame, color: 'text-warning bg-warning/10 border-warning/20' };
  }
  if (str.includes('week') || str.includes('check')) {
    return { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
  }
  if (str.includes('forge') || str.includes('score') || str.includes('zap')) {
    return { icon: Zap, color: 'text-primary bg-primary/10 border-primary/20' };
  }
  if (str.includes('day') || str.includes('calendar') || str.includes('most completed')) {
    return { icon: Calendar, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
  }
  if (str.includes('recovery') || str.includes('rebound')) {
    return { icon: RotateCcw, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
  }
  if (str.includes('habit') || str.includes('total')) {
    return { icon: Award, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
  }
  return { icon: Trophy, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
};

export const PersonalRecordsCard: React.FC<PersonalRecordsCardProps> = ({ records }) => {
  // Normalize records whether passed as array or dictionary object
  let items: PersonalRecordItem[] = [];

  if (Array.isArray(records)) {
    items = records.map((r: any) => ({
      label: r.label || r.title || 'Record',
      value: r.value || '0',
      date: r.date || r.achievedAt || r.subtitle || 'Lifetime',
    }));
  } else if (records && typeof records === 'object') {
    items = Object.values(records).map((r: any) => ({
      label: r?.label || r?.title || 'Record',
      value: r?.value || '0',
      date: r?.date || r?.achievedAt || r?.subtitle || 'Lifetime',
    }));
  }

  if (items.length === 0) {
    items = [
      { label: 'Longest Streak', value: '1 Day', date: 'Active Record' },
      { label: 'Best Week Rate', value: '100%', date: 'Past 30 Days' },
      { label: 'Highest Forge Score', value: '742', date: 'All-Time Peak' },
      { label: 'Most Habits in 1 Day', value: '5 Routines', date: 'Record Day' },
      { label: 'Total Completed Habits', value: '12', date: 'Lifetime' },
      { label: 'Fastest Recovery', value: '1 Day', date: 'Post-Miss Rebound' },
    ];
  }

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
        {items.map((item, idx) => {
          const { icon: Icon, color } = getRecordIcon(item.label);
          return (
            <div
              key={`${item.label}-${idx}`}
              className="p-4 rounded-xl bg-surface border border-border/70 flex items-center gap-3.5 hover:border-border-strong transition-colors"
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 truncate min-w-0">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                  {item.label}
                </span>
                <span className="text-base font-black text-foreground block tracking-tight truncate">
                  {item.value}
                </span>
                <span className="text-[10px] text-muted-foreground/80 block truncate">
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
