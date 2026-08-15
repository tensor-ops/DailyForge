import React from 'react';
import { Card } from '@/components/ui/Card';
import { Sparkles, ArrowRight } from 'lucide-react';

export const ForgeInsight: React.FC = () => {
  return (
    <Card className="bg-card border border-cyan-500/20 rounded-card p-5 flex flex-col justify-between h-full hover:border-cyan-500/45 transition-colors shadow-sm">
      <div className="flex items-center justify-between border-b border-border/10 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">✦ Forge Insight</span>
        </div>
        <span className="text-[9px] font-extrabold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
          AI Node
        </span>
      </div>

      <div className="py-3">
        <p className="text-xs text-foreground font-medium leading-relaxed">
          Your consistency is <strong className="text-cyan-400 font-extrabold">12% higher</strong> when your first habit is completed before 9 AM.
        </p>
      </div>

      <button className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors focus:outline-none w-max cursor-pointer">
        <span>View insight</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    </Card>
  );
};
