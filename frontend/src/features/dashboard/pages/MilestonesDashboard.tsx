import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { milestoneService } from '@/services/milestoneService';
import {
  MilestonesOverviewResponse,
  MomentItem,
} from '@/types/milestone';
import { MomentDetailModal } from '@/features/milestones/components/MomentDetailModal';
import { AchievementGalleryModal } from '@/features/milestones/components/AchievementGalleryModal';
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
  Target,
  Zap,
  Calendar,
  Grid,
  Pin,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const MilestonesDashboard: React.FC = () => {
  const [data, setData] = useState<MilestonesOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<MomentItem | null>(null);
  const [isMomentModalOpen, setIsMomentModalOpen] = useState(false);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const res = await milestoneService.getOverview();
      setData(res);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto text-left select-none animate-pulse pb-12">
        <div className="h-10 bg-muted/20 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-muted/20 rounded-2xl" />
          <div className="h-28 bg-muted/20 rounded-2xl" />
          <div className="h-28 bg-muted/20 rounded-2xl" />
          <div className="h-28 bg-muted/20 rounded-2xl" />
        </div>
        <div className="h-64 bg-muted/20 rounded-2xl" />
      </div>
    );
  }

  const {
    heroStats,
    personalRecords,
    heatmap,
    allAchievements,
    youAreClose,
    nextMilestones,
    moments,
    timeline,
  } = data!;

  const getMomentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="h-5 w-5 text-warning fill-warning" />;
      case 'Trophy':
        return <Trophy className="h-5 w-5 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="h-5 w-5 text-primary" />;
      case 'Award':
        return <Award className="h-5 w-5 text-emerald-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="h-5 w-5 text-cyan-400" />;
      case 'Target':
        return <Target className="h-5 w-5 text-rose-400" />;
      case 'Clock':
        return <Clock className="h-5 w-5 text-primary" />;
      case 'Zap':
        return <Zap className="h-5 w-5 text-amber-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in pb-12">
      {/* Header */}
      <PageHeader
        title="Milestones"
        description="Progress worth remembering. Every streak, record, and breakthrough is part of your Daily Forge history."
        actions={
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Achievement Gallery</span>
          </button>
        }
      />

      {/* Hero Summary Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current Streak"
          value={heroStats.currentStreak}
          subtext="Active daily consistency"
          icon={Flame}
          accent="orange"
        />
        <MetricCard
          title="Longest Streak"
          value={heroStats.longestStreak}
          subtext="All-time personal record"
          icon={Trophy}
          accent="blue"
        />
        <MetricCard
          title="Achievements"
          value={`${heroStats.achievementsUnlocked} / ${heroStats.totalAchievements}`}
          subtext="Badges & moments unlocked"
          icon={Award}
          accent="green"
        />
        <MetricCard
          title="Forge Score"
          value={`${heroStats.forgeScore}`}
          subtext="Composite execution rating"
          icon={Sparkles}
          accent="blue"
        />
      </div>

      {/* Personal Records Showcase */}
      <Card className="bg-card border border-border rounded-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>Personal Performance Records</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Peak historical performance benchmarks across your routines
            </p>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Lifetime Bests
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {personalRecords.map((rec, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-surface-elevated/70 border border-border/70 flex items-center justify-between gap-3 text-xs font-semibold"
            >
              <div className="space-y-0.5 min-w-0">
                <span className="text-foreground font-extrabold block truncate">
                  {rec.title}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  Previous best: {rec.previousBest}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-primary font-mono font-black text-sm block">
                  {rec.value}
                </span>
                <span className="text-[9px] text-muted-foreground block">
                  {rec.achievedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Streak Heatmap & "You're Close" Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Habit Contribution Heatmap (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="bg-card border border-border rounded-card p-5 space-y-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-warning fill-warning" />
                  <span>Habit Contribution History</span>
                </h3>
                <p className="text-xs text-muted-foreground">30-day streak & routine activity intensity</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">
                {heroStats.currentStreak} Active
              </span>
            </div>

            {/* Heatmap Grid */}
            <div className="space-y-2">
              <div className="grid grid-cols-10 gap-1.5 py-2">
                {heatmap.map((cell, idx) => (
                  <div
                    key={idx}
                    title={`${cell.date}: ${cell.count} routines (${cell.completionRate}% completion)`}
                    className={cn(
                      'aspect-square rounded-md transition-all border border-border/40 flex items-center justify-center text-[8px] font-mono font-bold cursor-default group',
                      cell.intensity === 4 ? 'bg-primary border-primary text-white shadow-sm' :
                      cell.intensity === 3 ? 'bg-primary/70 border-primary/80 text-white' :
                      cell.intensity === 2 ? 'bg-primary/40 border-primary/50 text-foreground' :
                      cell.intensity === 1 ? 'bg-primary/20 border-primary/30 text-muted-foreground' :
                      'bg-surface-sunken border-border/40 text-muted-foreground/40'
                    )}
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {cell.count}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                <span>30 days ago</span>
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  <div className="h-2 w-2 rounded-sm bg-surface-sunken border border-border/50" />
                  <div className="h-2 w-2 rounded-sm bg-primary/30" />
                  <div className="h-2 w-2 rounded-sm bg-primary/60" />
                  <div className="h-2 w-2 rounded-sm bg-primary" />
                  <span>More</span>
                </div>
                <span>Today</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic leading-relaxed">
              &quot;Consistency is built on the days when motivation doesn&apos;t show up.&quot;
            </p>
          </Card>
        </div>

        {/* "You're Close" Section (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="bg-card border border-border rounded-card p-5 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>You&apos;re Close</span>
                </h3>
                <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  Approaching
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Milestones nearing achievement threshold
              </p>
            </div>

            <div className="space-y-3">
              {(youAreClose.length > 0 ? youAreClose : nextMilestones).slice(0, 3).map((ach) => (
                <div
                  key={ach.id}
                  className="p-3 rounded-xl bg-surface-elevated/70 border border-border/70 space-y-1.5 text-xs font-semibold"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-bold">{ach.title}</span>
                    <span className="text-primary font-mono font-bold">{ach.progress}%</span>
                  </div>
                  <ProgressBar value={ach.progress} />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Target: {ach.threshold} {ach.category.toLowerCase()}</span>
                    <span>{ach.threshold - ach.currentValue} to go</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsGalleryOpen(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center justify-between pt-2 border-t border-border/60 cursor-pointer"
            >
              <span>View all upcoming milestones</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Card>
        </div>
      </div>

      {/* Collectible Moments Showcase (Digital Tokens) */}
      <Card className="bg-card border border-border rounded-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Your Moments</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Collectible digital recognition tokens earned through repeated execution
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold">Click to inspect</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {moments.map((moment) => (
            <div
              key={moment.id}
              onClick={() => {
                setSelectedMoment(moment);
                setIsMomentModalOpen(true);
              }}
              className="p-4 rounded-2xl bg-surface-elevated hover:bg-surface border border-border hover:border-primary/60 transition-all text-center flex flex-col justify-between gap-3 cursor-pointer group shadow-xs hover:scale-[1.02] active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider',
                    moment.rarity === 'LEGENDARY' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' :
                    moment.rarity === 'EPIC' ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' :
                    moment.rarity === 'RARE' ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' :
                    'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  )}
                >
                  {moment.rarity}
                </span>
                {moment.isPinned && <Pin className="h-3 w-3 text-primary fill-primary" />}
              </div>

              <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                {getMomentIcon(moment.icon)}
              </div>

              <div>
                <h4 className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">
                  {moment.title}
                </h4>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {moment.tier} Tier
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Achievement Timeline */}
      <Card className="bg-card border border-border rounded-card p-5 space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span>Achievement Timeline</span>
          </h3>
          <p className="text-xs text-muted-foreground">Chronological record of earned milestones and broken records</p>
        </div>

        <div className="space-y-3">
          {timeline.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border/70 flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  {getMomentIcon(item.icon)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-foreground font-extrabold block truncate">
                    {item.title}
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-muted-foreground shrink-0 font-bold">
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Modals */}
      <MomentDetailModal
        isOpen={isMomentModalOpen}
        onClose={() => {
          setIsMomentModalOpen(false);
          setSelectedMoment(null);
        }}
        moment={selectedMoment}
        onTogglePin={() => fetchMilestones()}
      />

      <AchievementGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        achievements={allAchievements}
        onSelectAchievement={(ach) => {
          setIsGalleryOpen(false);
          const matched = moments.find(m => m.code === ach.code);
          if (matched) {
            setSelectedMoment(matched);
            setIsMomentModalOpen(true);
          }
        }}
      />
    </div>
  );
};
