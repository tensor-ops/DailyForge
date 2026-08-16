import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { aiFoundationService } from '@/services/aiFoundationService';
import {
  InsightItem,
  RecommendationItem,
  DailyBriefData,
  WeeklyReviewData,
} from '@/types/aiFoundation';
import { PersonalizationCoverageBadge } from './PersonalizationCoverageBadge';
import { EvidenceDrawerModal } from '@/features/ai-insights/components/EvidenceDrawerModal';
import {
  Sparkles,
  Zap,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  RefreshCw,
  Clock,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const ForgeInsightsDashboard: React.FC = () => {
  const { success, info } = useToast();

  const [topInsight, setTopInsight] = useState<InsightItem | null>(null);
  const [feed, setFeed] = useState<InsightItem[]>([]);
  const [coverage, setCoverage] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [dailyBrief, setDailyBrief] = useState<DailyBriefData | null>(null);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReviewData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'recommendations' | 'brief' | 'weekly'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [evidenceModalInsight, setEvidenceModalInsight] = useState<InsightItem | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [feedData, recData, briefData, reviewData] = await Promise.all([
        aiFoundationService.getInsightFeed(),
        aiFoundationService.getRankedRecommendations(),
        aiFoundationService.getDailyBrief(),
        aiFoundationService.getWeeklyReview(),
      ]);

      setTopInsight(feedData.topInsight);
      setFeed(feedData.feed || []);
      setCoverage(feedData.personalizationCoverage);
      setRecommendations(recData.recommendations || []);
      setDailyBrief(briefData);
      setWeeklyReview(reviewData);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFeedback = async (insightId: string, rating: 'HELPFUL' | 'NOT_HELPFUL') => {
    try {
      await aiFoundationService.submitInsightFeedback(insightId, rating);
      success(
        rating === 'HELPFUL' ? 'Feedback recorded 👍' : 'Feedback recorded 👎',
        'Daily Forge AI will refine future signals.'
      );
      setFeed((prev) =>
        prev.map((item) =>
          item.id === insightId ? { ...item, feedback: { rating, comment: '' } } : item
        )
      );
    } catch {
      info('Feedback noted', 'Thank you for helping tune the intelligence model.');
    }
  };

  const handleRecommendationAction = async (recId: string, action: 'APPLY' | 'DISMISS') => {
    try {
      await aiFoundationService.handleRecommendationAction(recId, action);
      success(
        action === 'APPLY' ? 'Recommendation Applied ✨' : 'Recommendation Dismissed',
        action === 'APPLY' ? 'Routine adjustments synchronized.' : 'Recommendation hidden from feed.'
      );
      setRecommendations((prev) => prev.filter((r) => r.id !== recId && (r as any)._id !== recId));
    } catch {
      // fallback
    }
  };

  const filteredFeed = feed.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.type === selectedCategory || item.category === selectedCategory;
  });

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'STRONG_SIGNAL':
        return { label: 'Strong Signal', color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' };
      case 'MODERATE_SIGNAL':
        return { label: 'Moderate Signal', color: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' };
      case 'EXPERIMENT_SUPPORTED':
        return { label: 'Experiment Supported', color: 'bg-purple-500/15 border-purple-500/30 text-purple-400' };
      case 'EMERGING_SIGNAL':
      default:
        return { label: 'Emerging Signal', color: 'bg-amber-500/15 border-amber-500/30 text-amber-400' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in pb-12">
      {/* Header with Subtitle */}
      <PageHeader
        title="Forge Insights"
        description="Your behavior, interpreted. Your next move, clearer."
        actions={
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-elevated hover:bg-muted border border-border text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            <span>Refresh Intelligence</span>
          </button>
        }
      />

      {/* Intelligence Header Status & Personalization Coverage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <PersonalizationCoverageBadge coverage={coverage} />
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-sunken border border-border/80 text-xs flex items-center justify-between">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Intelligence Engine
            </span>
            <div className="flex items-center gap-1.5 font-extrabold text-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Grounded Deterministic Signal Engine</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground shrink-0">
            Real DB Telemetry
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border/60 pb-2 overflow-x-auto scrollbar-none font-bold text-xs">
        {[
          { id: 'feed', label: 'Intelligence Feed', icon: Sparkles },
          { id: 'recommendations', label: `Ranked Recommendations (${recommendations.length})`, icon: Zap },
          { id: 'brief', label: 'Daily Forge Brief', icon: Clock },
          { id: 'weekly', label: 'Weekly Review', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer select-none text-xs',
                isActive
                  ? 'bg-primary text-white font-extrabold shadow-sm'
                  : 'bg-surface-sunken text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INTELLIGENCE FEED */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Top Insight Hero Card */}
          {topInsight && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-primary/15 via-[#0D1527] to-[#0A1020] border-2 border-primary/40 shadow-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Top Behavioral Insight</span>
                </span>
                <span
                  className={cn(
                    'text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider',
                    getConfidenceBadge(topInsight.confidence).color
                  )}
                >
                  {getConfidenceBadge(topInsight.confidence).label}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-foreground leading-snug">
                  {topInsight.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {topInsight.summary}
                </p>
              </div>

              {/* Evidence Capsule */}
              {topInsight.evidence && (
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Observed Evidence
                    </span>
                    <span className="text-foreground font-mono font-bold block">
                      {topInsight.evidence.headline || topInsight.evidence.metric}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold text-sm">
                    {topInsight.evidence.difference}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  onClick={() => setEvidenceModalInsight(topInsight)}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-foreground rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Evidence Breakdown</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFeedback(topInsight.id || (topInsight as any)._id, 'HELPFUL')}
                    className={cn(
                      'p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                      topInsight.feedback?.rating === 'HELPFUL'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-surface-elevated hover:bg-muted border-border text-muted-foreground'
                    )}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(topInsight.id || (topInsight as any)._id, 'NOT_HELPFUL')}
                    className={cn(
                      'p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                      topInsight.feedback?.rating === 'NOT_HELPFUL'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-surface-elevated hover:bg-muted border-border text-muted-foreground'
                    )}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feed Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-bold text-[11px]">
            {['ALL', 'PATTERN', 'WARNING', 'EXPERIMENT', 'CELEBRATION'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3 py-1 rounded-xl uppercase tracking-wider transition-all cursor-pointer select-none',
                  selectedCategory === cat
                    ? 'bg-primary text-white font-extrabold shadow-sm'
                    : 'bg-surface-sunken text-muted-foreground hover:text-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeed.map((item) => (
              <div
                key={item.id || (item as any)._id}
                className="p-4 rounded-2xl bg-surface-elevated border border-border/80 shadow-sm flex flex-col justify-between gap-3 text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-primary font-bold">
                      {item.type} • {item.category}
                    </span>
                    <span
                      className={cn(
                        'text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider',
                        getConfidenceBadge(item.confidence).color
                      )}
                    >
                      {getConfidenceBadge(item.confidence).label}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-foreground leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {item.evidence && (
                  <div className="p-2.5 rounded-xl bg-surface-sunken border border-border/60 flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-muted-foreground truncate">{item.evidence.headline || item.evidence.metric}</span>
                    <span className="text-emerald-400 font-mono font-bold shrink-0 ml-2">{item.evidence.difference}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <button
                    onClick={() => setEvidenceModalInsight(item)}
                    className="text-primary hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Evidence</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleFeedback(item.id || (item as any)._id, 'HELPFUL')}
                      className={cn(
                        'p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer',
                        item.feedback?.rating === 'HELPFUL'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-surface-sunken hover:bg-muted border-border/60 text-muted-foreground'
                      )}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleFeedback(item.id || (item as any)._id, 'NOT_HELPFUL')}
                      className={cn(
                        'p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer',
                        item.feedback?.rating === 'NOT_HELPFUL'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                          : 'bg-surface-sunken hover:bg-muted border-border/60 text-muted-foreground'
                      )}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RANKED RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={rec.id || (rec as any)._id}
                className="p-4 rounded-2xl bg-surface-elevated border border-border/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-mono font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-extrabold text-foreground truncate">
                      {rec.title}
                    </h4>
                    <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
                      {rec.expectedImpact} Impact
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {rec.reason}
                  </p>
                  {rec.evidence && (
                    <div className="text-[10px] font-mono text-emerald-400">
                      Evidence: {rec.evidence.difference} ({rec.evidence.sampleCount} observations)
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRecommendationAction(rec.id || (rec as any)._id, 'DISMISS')}
                    className="px-3 py-2 bg-surface-sunken hover:bg-muted border border-border text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleRecommendationAction(rec.id || (rec as any)._id, 'APPLY')}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-[0.98]"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Apply Recommendation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DAILY FORGE BRIEF */}
      {activeTab === 'brief' && dailyBrief && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Daily Forge Brief • {dailyBrief.date}</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              Circadian Optimized
            </span>
          </div>

          <h3 className="text-base font-extrabold text-foreground">
            {dailyBrief.headline}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-sunken border border-border/80 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Core Focus Priority
              </span>
              <p className="text-foreground font-bold">{dailyBrief.todayPriority}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-sunken border border-border/80 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase">
                Risk Warning & Boundary
              </span>
              <p className="text-foreground font-bold">{dailyBrief.riskWarning}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-sunken border border-border/80 space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase">
                Habit Protection Protocol
              </span>
              <p className="text-foreground font-bold">{dailyBrief.habitProtection}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-sunken border border-border/80 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">
                Goal Action
              </span>
              <p className="text-foreground font-bold">{dailyBrief.goalAction}</p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: WEEKLY REVIEW */}
      {activeTab === 'weekly' && weeklyReview && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Weekly Forge Review • {weeklyReview.timeframe}</span>
            </span>
            <span className="text-xs font-mono font-bold text-foreground">
              Consistency: {weeklyReview.consistencyRate}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/25 space-y-1">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">
              Core Weekly Synthesis
            </span>
            <p className="text-xs font-semibold text-foreground leading-relaxed">
              {weeklyReview.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-sunken border border-border/70">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase">Best Habit</span>
              <span className="text-foreground font-bold truncate block">{weeklyReview.bestHabit}</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-sunken border border-border/70">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase">Weakest Habit</span>
              <span className="text-amber-400 font-bold truncate block">{weeklyReview.weakestHabit}</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-sunken border border-border/70">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase">Longest Streak</span>
              <span className="text-foreground font-bold truncate block">{weeklyReview.longestStreak}</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-sunken border border-border/70">
              <span className="text-[10px] text-muted-foreground block font-bold uppercase">Achievements</span>
              <span className="text-emerald-400 font-bold truncate block">+{weeklyReview.achievementsUnlocked} Unlocked</span>
            </div>
          </div>
        </Card>
      )}

      {/* Evidence Drawer Modal */}
      <EvidenceDrawerModal
        isOpen={!!evidenceModalInsight}
        onClose={() => setEvidenceModalInsight(null)}
        insight={evidenceModalInsight}
      />
    </div>
  );
};
