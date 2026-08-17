import React from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { MomentItem } from '@/types/milestone';
import { useToast } from '@/hooks/useToast';
import { milestoneService } from '@/services/milestoneService';
import {
  Sparkles,
  Trophy,
  Flame,
  Award,
  Clock,
  ShieldCheck,
  Target,
  Zap,
  Pin,
  PinOff,
  Share2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface MomentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  moment: MomentItem | null;
  onTogglePin?: (code: string) => void;
}

export const MomentDetailModal: React.FC<MomentDetailModalProps> = ({
  isOpen,
  onClose,
  moment,
  onTogglePin,
}) => {
  const { success, error } = useToast();

  if (!moment) return null;

  const handleTogglePin = async () => {
    try {
      await milestoneService.togglePinMoment(moment.code);
      moment.isPinned = !moment.isPinned;
      success(
        moment.isPinned ? 'Moment Pinned 📌' : 'Moment Unpinned',
        `"${moment.title}" has been updated in your showcase.`
      );
      onTogglePin?.(moment.code);
    } catch {
      error('Failed to pin moment', 'Please try again.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `🔥 DailyForge Moment: "${moment.title}" (${moment.rarity})\n${moment.description}\nUnlocked on DailyForge`
    );
    success('Moment Copied! ✨', 'Summary copied to clipboard for sharing.');
  };

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY':
        return {
          badge: 'bg-amber-500/15 border-amber-500/30 text-amber-500 dark:text-amber-400 font-extrabold',
          medallion: 'bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400 shadow-amber-500/10',
          cardBorder: 'border-amber-500/40 hover:border-amber-500/60 shadow-amber-500/5',
          gradient: 'from-amber-500/10 via-surface-elevated to-surface-sunken/60',
          iconColor: '#F59E0B',
        };
      case 'EPIC':
        return {
          badge: 'bg-purple-500/15 border-purple-500/30 text-purple-500 dark:text-purple-400 font-extrabold',
          medallion: 'bg-purple-500/10 border-purple-500/30 text-purple-500 dark:text-purple-400 shadow-purple-500/10',
          cardBorder: 'border-purple-500/40 hover:border-purple-500/60 shadow-purple-500/5',
          gradient: 'from-purple-500/10 via-surface-elevated to-surface-sunken/60',
          iconColor: '#A855F7',
        };
      case 'RARE':
        return {
          badge: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-extrabold',
          medallion: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-cyan-500/10',
          cardBorder: 'border-cyan-500/40 hover:border-cyan-500/60 shadow-cyan-500/5',
          gradient: 'from-cyan-500/10 via-surface-elevated to-surface-sunken/60',
          iconColor: '#06B6D4',
        };
      default:
        return {
          badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold',
          medallion: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10',
          cardBorder: 'border-emerald-500/40 hover:border-emerald-500/60 shadow-emerald-500/5',
          gradient: 'from-emerald-500/10 via-surface-elevated to-surface-sunken/60',
          iconColor: '#10B981',
        };
    }
  };

  const getMomentIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="h-10 w-10 sm:h-12 sm:w-12" />;
      case 'Trophy':
        return <Trophy className="h-10 w-10 sm:h-12 sm:w-12" />;
      case 'Sparkles':
        return <Sparkles className="h-10 w-10 sm:h-12 sm:w-12" />;
      case 'Award':
        return <Award className="h-10 w-10 sm:h-12 sm:w-12" />;
      case 'Clock':
        return <Clock className="h-10 w-10 sm:h-12 sm:w-12" />;
      case 'ShieldCheck':
        return <ShieldCheck className="h-10 w-10 sm:h-12 sm:w-12" />;
      case 'Target':
        return <Target className="h-10 w-10 sm:h-12 sm:w-12" />;
      case 'Zap':
        return <Zap className="h-10 w-10 sm:h-12 sm:w-12" />;
      default:
        return <Trophy className="h-10 w-10 sm:h-12 sm:w-12" />;
    }
  };

  const rarityConfig = getRarityConfig(moment.rarity);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Collectible Moment"
      description="Tokenized proof of an extraordinary consistency milestone or personal record."
      icon={Sparkles}
      iconColor={rarityConfig.iconColor}
      size="md"
      footer={
        <div className="flex items-center justify-between gap-2.5 w-full flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-border bg-surface hover:bg-muted text-foreground transition-all cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleTogglePin}
              className={cn(
                'py-2 px-3.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                moment.isPinned
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 dark:text-amber-400'
                  : 'bg-surface hover:bg-muted border-border text-foreground'
              )}
            >
              {moment.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
              <span>{moment.isPinned ? 'Unpin' : 'Pin to Top'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share Moment</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-center select-none pt-1">
        {/* Hero Collectible Token Card */}
        <div
          className={cn(
            'p-5 sm:p-6 rounded-3xl border-2 shadow-xl relative overflow-hidden transition-all space-y-4 max-w-[480px] mx-auto bg-gradient-to-b',
            rarityConfig.gradient,
            rarityConfig.cardBorder
          )}
        >
          {/* Top Token Ribbon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-muted-foreground">
                DAILY FORGE COLLECTIBLE
              </span>
            </div>
            <span
              className={cn(
                'text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider shadow-2xs',
                rarityConfig.badge
              )}
            >
              {moment.rarity}
            </span>
          </div>

          {/* Centered Large Hero Icon Medallion */}
          <div className="py-2">
            <div
              className={cn(
                'h-20 w-20 sm:h-24 sm:w-24 mx-auto rounded-3xl border-2 flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300',
                rarityConfig.medallion
              )}
            >
              {getMomentIcon(moment.icon)}
            </div>
          </div>

          {/* Achievement Title & Supporting Description */}
          <div className="space-y-1.5 px-2">
            <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-tight">
              {moment.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              {moment.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/70 text-left">
            <div className="p-2.5 rounded-xl bg-surface/70 border border-border/70">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Category
              </span>
              <span className="text-xs font-bold text-foreground truncate block mt-0.5">
                {moment.category || 'Milestone'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface/70 border border-border/70">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Tier Rank
              </span>
              <span className="text-xs font-bold text-foreground truncate block mt-0.5">
                {moment.tier || 'Gold'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface/70 border border-border/70">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Earned Date
              </span>
              <span className="text-xs font-bold text-foreground truncate block mt-0.5">
                {moment.unlockedAt ? new Date(moment.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Achieved'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface/70 border border-border/70">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Token Serial
              </span>
              <span className="text-xs font-mono font-bold text-primary truncate block mt-0.5">
                #{moment.code}
              </span>
            </div>
          </div>
        </div>

        {/* Celebratory Motivational Message */}
        <div className="p-3.5 rounded-2xl bg-surface-sunken/80 border border-border/80 text-xs text-muted-foreground max-w-[480px] mx-auto flex items-center gap-3 text-left">
          <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Flame className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground text-xs leading-snug">
              You forged something worth remembering.
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Consistency compounds over time. Keep the momentum going!
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
