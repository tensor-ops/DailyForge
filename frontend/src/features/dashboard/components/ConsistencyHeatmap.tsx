import React from 'react';
import { Card } from '@/components/ui/Card';

export const ConsistencyHeatmap: React.FC = () => {
  const rows = 7;
  const cols = 12;

  const grid = [
    [2, 0, 1, 3, 0, 2, 4, 1, 0, 3, 2, 1],
    [0, 3, 2, 0, 4, 1, 0, 2, 3, 1, 0, 4],
    [1, 2, 0, 3, 1, 0, 2, 4, 0, 3, 2, 0],
    [3, 0, 4, 1, 0, 2, 3, 0, 1, 4, 2, 0],
    [2, 1, 0, 3, 2, 1, 0, 2, 4, 0, 1, 3],
    [0, 2, 3, 0, 1, 4, 2, 0, 3, 1, 0, 2],
    [1, 0, 2, 4, 0, 1, 3, 2, 0, 4, 1, 3]
  ];

  const getCellColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-900/40 border border-blue-800/10'; // Low: dark slate/blue
      case 2: return 'bg-primary/50 border border-primary/20'; // Med: dark blue
      case 3: return 'bg-primary border border-primary/30'; // High: bright blue
      case 4: return 'bg-cyan-500 border border-cyan-400/20'; // Excellent: cyan/emerald
      default: return 'bg-muted/40 border border-border/10'; // None
    }
  };

  const days = ['M', '', 'W', '', 'F', '', 'S'];

  return (
    <Card className="bg-card border border-border rounded-card p-5 flex flex-col gap-4 h-full justify-between">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Consistency Heatmap</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Visual matrix of the last 12 weeks</p>
      </div>

      <div className="flex gap-2 items-center justify-center py-2 select-none overflow-x-auto scrollbar-none">
        {/* Day Labels */}
        <div className="flex flex-col gap-1.5 text-[9px] font-bold text-muted-foreground/60 w-3 pr-1 justify-around h-[120px]">
          {days.map((d, i) => (
            <span key={i} className="h-3 flex items-center">{d}</span>
          ))}
        </div>

        {/* Contribution grid columns */}
        <div className="flex gap-1.5">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={cIdx} className="flex flex-col gap-1.5">
              {Array.from({ length: rows }).map((_, rIdx) => {
                const level = grid[rIdx]?.[cIdx] || 0;
                return (
                  <div
                    key={rIdx}
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-[2px] transition-all hover:scale-110 cursor-pointer ${getCellColor(level)}`}
                    title={`Day ${(cIdx * 7) + rIdx + 1}: Level ${level} consistency`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Grid Legend */}
      <div className="flex items-center justify-end gap-1.5 text-[9px] text-muted-foreground font-semibold">
        <span>Less consistent</span>
        <div className="h-2.5 w-2.5 rounded-[2px] bg-muted/40 border border-border/10" />
        <div className="h-2.5 w-2.5 rounded-[2px] bg-blue-900/40" />
        <div className="h-2.5 w-2.5 rounded-[2px] bg-primary/50" />
        <div className="h-2.5 w-2.5 rounded-[2px] bg-primary" />
        <div className="h-2.5 w-2.5 rounded-[2px] bg-cyan-500" />
        <span>More consistent</span>
      </div>
    </Card>
  );
};
