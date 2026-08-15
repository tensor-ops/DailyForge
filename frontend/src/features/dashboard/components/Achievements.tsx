import React from 'react';
import { Card } from '@/components/ui/Card';
import { Flame, Trophy, Zap, BookOpen, Target } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  color: string;
}

export const Achievements: React.FC = () => {
  const achievementsList: AchievementItem[] = [
    { 
      id: 'a1', 
      title: '7 Day Streak', 
      description: 'Forged consistency for 7 consecutive days', 
      icon: Flame, 
      unlocked: true,
      color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20'
    },
    { 
      id: 'a2', 
      title: '30 Day Consistency', 
      description: 'Maintained 80%+ consistency for a full month', 
      icon: Trophy, 
      unlocked: true,
      color: 'text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/20'
    },
    { 
      id: 'a3', 
      title: 'Early Starter', 
      description: 'Completed a habit before 08:00 AM', 
      icon: Zap, 
      unlocked: true,
      color: 'text-cyan-400 bg-cyan-400/10 border-cyan-450/20'
    },
    { 
      id: 'a4', 
      title: '100 Hours Learning', 
      description: 'Logged 100 hours in study categories', 
      icon: BookOpen, 
      unlocked: false,
      color: 'text-muted-foreground bg-muted/10 border-border/10'
    },
    { 
      id: 'a5', 
      title: '90% Weekly Completion', 
      description: 'Reached 90% completion rate in a single week', 
      icon: Target, 
      unlocked: false,
      color: 'text-muted-foreground bg-muted/10 border-border/10'
    }
  ];

  return (
    <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Unlocked system milestones</p>
      </div>

      <div className="space-y-2.5 my-auto max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
        {achievementsList.map((ach) => {
          const Icon = ach.icon;
          return (
            <div 
              key={ach.id} 
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl border transition-all select-none",
                ach.unlocked 
                  ? "border-border/15 bg-[#131B29] hover:border-border/25" 
                  : "border-border/5 bg-[#101622] opacity-50"
              )}
            >
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border", ach.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-200 truncate">{ach.title}</h4>
                <p className="text-[10px] text-muted-foreground truncate">{ach.description}</p>
              </div>
              {ach.unlocked && (
                <span className="text-[9px] font-extrabold text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 rounded-full uppercase shrink-0">
                  Unlocked
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
