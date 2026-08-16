import React from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { MomentItem } from '@/types/milestone';
import { useToast } from '@/hooks/useToast';
import { milestoneService } from '@/services/milestoneService';
import {
  Sparkles,
  Trophy,
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

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY':
        return 'border-amber-500/50 bg-gradient-to-b from-amber-500/15 via-[#0D1527] to-[#0A1020] text-amber-400';
      case 'EPIC':
        return 'border-purple-500/50 bg-gradient-to-b from-purple-500/15 via-[#0D1527] to-[#0A1020] text-purple-400';
      case 'RARE':
        return 'border-cyan-500/50 bg-gradient-to-b from-cyan-500/15 via-[#0D1527] to-[#0A1020] text-cyan-400';
      default:
        return 'border-emerald-500/50 bg-gradient-to-b from-emerald-500/15 via-[#0D1527] to-[#0A1020] text-emerald-400';
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Collectible Moment"
      description="Tokenized proof of an extraordinary consistency milestone or personal record."
      icon={Sparkles}
      iconColor="#F59E0B"
      size="sm"
    >
      <div className="space-y-4 text-center select-none pt-1">
        {/* Token Card Showcase */}
        <div
          className={cn(
            'p-6 rounded-3xl border-2 shadow-2xl relative overflow-hidden transition-all space-y-4',
            getRarityGlow(moment.rarity)
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
              Daily Forge Collectible
            </span>
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-white/10">
              {moment.rarity}
            </span>
          </div>

          <div className="h-16 w-16 mx-auto rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
            <Trophy className="h-8 w-8 text-amber-400" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white tracking-tight">
              {moment.title}
            </h3>
            <p className="text-xs text-slate-300 leading-snug">
              {moment.description}
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{moment.unlockedAt ? new Date(moment.unlockedAt).toLocaleDateString() : 'Achieved'}</span>
            </span>
            <span>#{moment.code}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={handleTogglePin}
            className={cn(
              'py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer',
              moment.isPinned
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-surface-elevated hover:bg-muted border-border text-foreground'
            )}
          >
            {moment.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            <span>{moment.isPinned ? 'Unpin from Top' : 'Pin to Top'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="py-2 px-3 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Copy & Share</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
};
