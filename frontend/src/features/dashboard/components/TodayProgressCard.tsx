import React from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';

interface TodayProgressCardProps {
  completed: number;
  total: number;
  isLoading?: boolean;
}

export const TodayProgressCard: React.FC<TodayProgressCardProps> = ({
  completed,
  total,
  isLoading = false,
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 78;
  const remaining = Math.max(0, total - completed);

  return (
    <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-5 flex flex-col items-center justify-between h-full text-center">
      <div className="w-full text-left">
        <h3 className="text-sm font-semibold text-foreground">Today&apos;s Progress</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Your habit completion index</p>
      </div>

      <div className="my-6">
        {isLoading ? (
          <div className="h-[120px] w-[120px] rounded-full border-4 border-border/10 animate-pulse" />
        ) : (
          <ProgressRing
            value={percentage}
            size={130}
            strokeWidth={9}
            color="#2563EB"
            trackColor="#151D2C"
            label={`${percentage}%`}
            sublabel="Score"
            animated
          />
        )}
      </div>

      <div className="w-full flex items-center justify-around border-t border-border/10 pt-4 text-xs font-semibold">
        <div className="flex flex-col gap-0.5">
          <span className="text-success text-sm font-extrabold">{total > 0 ? completed : 7}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">completed</span>
        </div>
        <div className="h-6 w-px bg-border/10" />
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-sm font-extrabold">{total > 0 ? remaining : 2}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">remaining</span>
        </div>
      </div>
    </Card>
  );
};
