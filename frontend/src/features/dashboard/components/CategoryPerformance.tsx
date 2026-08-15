import React from 'react';
import { Card } from '@/components/ui/Card';

export const CategoryPerformance: React.FC = () => {
  const categories = [
    { name: 'Health', value: 92, count: '12 completed', color: 'bg-success' }, // Emerald
    { name: 'Learning', value: 85, count: '8 completed', color: 'bg-primary' },  // Primary Blue
    { name: 'Fitness', value: 78, count: '14 completed', color: 'bg-primary' },
    { name: 'Career', value: 74, count: '9 completed', color: 'bg-primary' },
    { name: 'Personal', value: 68, count: '6 completed', color: 'bg-primary' },
    { name: 'Mindfulness', value: 88, count: '11 completed', color: 'bg-success' },
  ];

  return (
    <Card className="bg-card border border-border rounded-card p-5 flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Category Performance</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Average consistency score by category</p>
      </div>

      <div className="space-y-3.5 my-auto">
        {categories.map((cat) => (
          <div key={cat.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground">{cat.name}</span>
              <span className="text-muted-foreground font-mono">{cat.value}%</span>
            </div>

            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`${cat.color} h-full rounded-full transition-all duration-550`}
                style={{ width: `${cat.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
