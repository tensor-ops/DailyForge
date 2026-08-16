import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { MomentItem } from '@/types/milestone';
import { useToast } from '@/hooks/useToast';
import { milestoneService } from '@/services/milestoneService';
import {
  Sparkles,
  Flame,
  Trophy,
  Award,
  ShieldCheck,
  Target,
  Pin,
  PinOff,
  Share2,
  Calendar,
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
      `🔥 Daily Forge Moment: "${moment.title}" (${moment.rarity})\n${moment.description}\nUnlocked on Daily Forge`
    );
    success('Moment Copied! ✨', 'Summary copied to clipboard for sharing.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Forge Moment"
      description="Collectible Recognition Token"
      size="md"
    >
      <div className="space-y-5 text-left pt-1">
        {/* Token Card Showcase */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#131F3A] to-[#0A1020] border border-border/90 relative overflow-hidden text-center shadow-xl">
          {/* Subtle Glow Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

          {/* Rarity & Tier Row */}
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest relative z-10">
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full border',
                moment.rarity === 'LEGENDARY' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                moment.rarity === 'EPIC' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                moment.rarity === 'RARE' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              )}
            >
              ◆ {moment.rarity}
            </span>
            <span className="text-muted-foreground">{moment.tier} TIER</span>
          </div>

          {/* Large Center Icon */}
          <div className="my-5 relative z-10">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-lg">
              {moment.icon === 'Flame' && <Flame className="h-8 w-8 text-primary fill-primary" />}
              {moment.icon === 'Trophy' && <Trophy className="h-8 w-8 text-amber-400" />}
              {moment.icon === 'Sparkles' && <Sparkles className="h-8 w-8 text-primary" />}
              {moment.icon === 'Award' && <Award className="h-8 w-8 text-emerald-400" />}
              {moment.icon === 'ShieldCheck' && <ShieldCheck className="h-8 w-8 text-cyan-400" />}
              {moment.icon === 'Target' && <Target className="h-8 w-8 text-rose-400" />}
              {!['Flame', 'Trophy', 'Sparkles', 'Award', 'ShieldCheck', 'Target'].includes(moment.icon) && (
                <Sparkles className="h-8 w-8 text-primary" />
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-1 relative z-10">
            <h3 className="text-xl font-black text-foreground tracking-tight">{moment.title}</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed font-semibold">
              {moment.description}
            </p>
          </div>

          {/* Unlock Date */}
          <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-center gap-1 font-semibold relative z-10">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Unlocked: {moment.unlockedAt ? new Date(moment.unlockedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Active Record'}</span>
          </div>
        </div>

        {/* Supporting Context Row */}
        <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
          <div className="p-3 rounded-xl bg-surface-elevated border border-border/70">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
              Related Routine
            </span>
            <span className="text-foreground font-bold truncate block">
              {moment.relatedHabitTitle || 'Core Habits'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-elevated border border-border/70">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
              Connected Goal
            </span>
            <span className="text-primary font-bold truncate block">
              {moment.relatedGoalTitle || 'Daily Consistency'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <button
            onClick={handleTogglePin}
            className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-muted border border-border text-foreground text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {moment.isPinned ? (
              <>
                <PinOff className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Unpin Moment</span>
              </>
            ) : (
              <>
                <Pin className="h-3.5 w-3.5 text-primary" />
                <span>Pin to Showcase</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Moment</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
