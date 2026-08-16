import React, { useState, useEffect } from 'react';
import { aiFoundationService } from '@/services/aiFoundationService';
import { HabitRiskMap } from '@/types/aiFoundation';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HabitRiskMapWidgetProps {
  className?: string;
}

export const HabitRiskMapWidget: React.FC<HabitRiskMapWidgetProps> = ({ className }) => {
  const [riskMap, setRiskMap] = useState<HabitRiskMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRisk = async () => {
      try {
        const res = await aiFoundationService.getHabitRiskMap();
        setRiskMap(res);
      } catch (err) {
        console.error('Failed to load habit risk map:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadRisk();
  }, []);

  if (isLoading || !riskMap) return null;

  const totalHabits =
    riskMap.atRisk.length + riskMap.watch.length + riskMap.stable.length;

  if (totalHabits === 0) return null;

  return (
    <div className={cn('p-5 rounded-3xl bg-surface-sunken border border-border/80 space-y-4 text-xs select-none', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <h3 className="font-extrabold text-foreground text-sm">
            Predictive Habit Risk Telemetry
          </h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          Early Warning Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* At Risk Column */}
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
              At Risk ({riskMap.atRisk.length})
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
          </div>
          {riskMap.atRisk.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">No habits at risk 🎉</p>
          ) : (
            <div className="space-y-1.5">
              {riskMap.atRisk.map((h) => (
                <div key={h.habitId} className="p-2 rounded-xl bg-black/30 border border-rose-500/20 text-xs">
                  <div className="font-bold text-foreground truncate">{h.name}</div>
                  <p className="text-[10px] text-rose-300/80 mt-0.5 leading-snug">{h.suggestedMitigation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Watch Column */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
              Watch ({riskMap.watch.length})
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          </div>
          {riskMap.watch.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">All stable.</p>
          ) : (
            <div className="space-y-1.5">
              {riskMap.watch.map((h) => (
                <div key={h.habitId} className="p-2 rounded-xl bg-black/30 border border-amber-500/20 text-xs">
                  <div className="font-bold text-foreground truncate">{h.name}</div>
                  <p className="text-[10px] text-amber-300/80 mt-0.5 leading-snug">{h.suggestedMitigation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stable Column */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
              Stable Automaticity ({riskMap.stable.length})
            </span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="space-y-1.5">
            {riskMap.stable.map((h) => (
              <div key={h.habitId} className="p-2 rounded-xl bg-black/30 border border-emerald-500/20 text-xs">
                <div className="font-bold text-foreground truncate">{h.name}</div>
                <span className="text-[10px] font-mono text-emerald-400">7-Day: {h.recent7DayRate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
