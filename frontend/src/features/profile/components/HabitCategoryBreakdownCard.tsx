import React from 'react';
import { Card } from '@/components/ui/Card';
import { HabitCategoryMetric } from '@/types/profile';
import { Layers } from 'lucide-react';

interface HabitCategoryBreakdownCardProps {
  categories?: HabitCategoryMetric[];
}

export const HabitCategoryBreakdownCard: React.FC<HabitCategoryBreakdownCardProps> = ({ categories = [] }) => {
  const safeCategories = Array.isArray(categories) ? categories : [];

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
        {safeCategories.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No habit categories active yet.
          </div>
        ) : (
          safeCategories.map((cat, idx) => {
            const categoryName = cat?.category || `Category ${idx + 1}`;
            const count = cat?.count ?? 0;
            const streak = cat?.averageStreak ?? 0;
            const rate = cat?.completionRate ?? 0;

            return (
              <div key={`${categoryName}-${idx}`} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">{categoryName}</span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-[10px] font-medium">{count} habits</span>
                    <span className="text-[10px] font-medium text-warning">🔥 {streak}d streak</span>
                    <span className="font-extrabold text-foreground">{rate}%</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
