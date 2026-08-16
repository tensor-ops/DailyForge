import React from 'react';
import { Card } from '@/components/ui/Card';
import { HabitCategoryMetric } from '@/types/profile';
import { Layers } from 'lucide-react';

interface HabitCategoryBreakdownCardProps {
  categories: HabitCategoryMetric[];
}

export const HabitCategoryBreakdownCard: React.FC<HabitCategoryBreakdownCardProps> = ({ categories }) => {
  return (
    <Card className="p-6 bg-surface-elevated border-border shadow-card h-full flex flex-col justify-between space-y-5">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Habit Breakdown by Area
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Execution balance across focus domains</p>
        </div>
      </div>

      <div className="space-y-3.5 flex-1">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No habit categories active yet.
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">{cat.category}</span>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="text-[10px] font-medium">{cat.count} habits</span>
                  <span className="text-[10px] font-medium text-warning">🔥 {cat.averageStreak}d streak</span>
                  <span className="font-extrabold text-foreground">{cat.completionRate}%</span>
                </div>
              </div>

              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, cat.completionRate)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
