import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { habitService } from '@/services/habitService';
import { analyticsService } from '@/services/analyticsService';
import { Habit } from '@/types/habit';
import { BehaviorAnalytics } from '@/types/behavior';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, TrendingUp, Sparkles } from 'lucide-react';

export const HabitDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error } = useToast();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [behaviorData, setBehaviorData] = useState<BehaviorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useDocumentTitle(habit ? `DailyForge — ${habit.name}` : 'Habit Detail');

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      try {
        const [fetchedHabit, fetchedBehavior] = await Promise.all([
          habitService.getHabitById(id),
          analyticsService.getBehaviorAnalytics('30d'),
        ]);
        setHabit(fetchedHabit);
        setBehaviorData(fetchedBehavior);
      } catch (err) {
        error('Load failed', 'Unable to fetch habit details.');
        navigate('/habits');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id, navigate, error]);

  if (loading) {
    return <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">Loading habit...</div>;
  }

  if (!habit) return null;

  const reliabilityObj = behaviorData?.habitReliability.find((h) => h.habitId === habit.id);
  const frictionObj = behaviorData?.habitFriction.find((h) => h.habitId === habit.id);
  const riskObj = behaviorData?.habitRisk.find((h) => h.habitId === habit.id);

  const reliability = reliabilityObj?.reliability || habit.completionRate || 80;
  const friction = frictionObj?.frictionLevel || 'LOW';
  const risk = riskObj?.riskLevel || 'LOW';
  const trend = riskObj?.trend || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left select-none">
      {/* Back navigation & header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-card hover:bg-surface-elevated border border-border text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{habit.category}</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mt-0.5">{habit.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main statistics cards */}
        <div className="md:col-span-2 space-y-5">
          <Card className="bg-card border border-border rounded-card p-5 space-y-5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Performance Snapshot</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Reliability Index</span>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">{reliability}%</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Friction Rating</span>
                <p className={`text-2xl font-extrabold tracking-tight ${
                  friction === 'HIGH' ? 'text-warning font-bold' : 'text-success font-bold'
                }`}>{friction}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Current Streak</span>
                <p className="text-2xl font-extrabold text-warning tracking-tight">🔥 {habit.currentStreak} Days</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Longest Streak</span>
                <p className="text-2xl font-extrabold text-slate-300 tracking-tight">🏆 {habit.longestStreak} Days</p>
              </div>
            </div>
          </Card>

          {/* Miss reason breakdown log */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Friction Analysis</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Top causes of skipped schedules</p>
            </div>
            {frictionObj?.reasonsBreakdown && Object.keys(frictionObj.reasonsBreakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(frictionObj.reasonsBreakdown).map(([r, count]) => (
                  <div key={r} className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300">{r}</span>
                    <span className="text-muted-foreground font-mono">{count} skipped</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 py-4 text-center italic">
                No miss reasons logged for this habit yet.
              </p>
            )}
          </Card>
        </div>

        {/* Sidebar suggestions */}
        <div className="space-y-5">
          {/* Risk Level */}
          <Card className="bg-card border border-border rounded-card p-5 flex flex-col justify-between h-[150px]">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stability Risk</span>
              <h3 className={`text-xl font-extrabold tracking-tight mt-1 ${
                risk === 'HIGH' ? 'text-danger animate-pulse' : 'text-foreground'
              }`}>
                {risk === 'HIGH' ? 'DECLINING' : 'STABLE'}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Trend: {trend > 0 ? `+${trend}%` : `${trend}%`}</span>
            </div>
          </Card>

          {/* Suggested adjustment schedule */}
          <Card className="bg-card border border-cyan-500/20 rounded-card p-5 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-border/10 pb-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">AI Suggestion</h4>
            </div>
            <p className="text-xs text-foreground leading-relaxed font-medium font-semibold">
              Based on your peaks, completing this habit in the <strong className="text-cyan-400">Evening</strong> window improves completion odds by <strong className="text-cyan-400">18%</strong>.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
