import React from 'react';
import { mockAchievements, MockAchievement } from '../data/mockDashboardData';
import { cn } from '@/utils/cn';

interface AchievementsProps {
  achievements?: MockAchievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements = mockAchievements }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Your consistency milestones</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievements.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
              item.unlocked
                ? 'bg-warning/5 border-warning/20 hover:border-warning/30'
                : 'bg-muted/10 border-border/40 opacity-55'
            )}
          >
            <span className="text-2xl shrink-0">{item.icon}</span>
            <div className="min-w-0">
              <h4
                className={cn(
                  'text-xs font-semibold truncate',
                  item.unlocked ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {item.title}
              </h4>
              <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
