import React, { useState } from 'react';
import { Dialog } from '@/components/dialogs/Dialog';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AchievementItem } from '@/types/milestone';
import {
  Flame,
  Trophy,
  Sparkles,
  Award,
  ShieldCheck,
  Target,
  Clock,
  Zap,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface AchievementGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: AchievementItem[];
  onSelectAchievement?: (achievement: AchievementItem) => void;
}

export const AchievementGalleryModal: React.FC<AchievementGalleryModalProps> = ({
  isOpen,
  onClose,
  achievements,
  onSelectAchievement,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');

  const categories = [
    'ALL',
    'STREAK',
    'CONSISTENCY',
    'EXECUTION',
    'GOALS',
    'RECOVERY',
    'PERFORMANCE',
  ];

  const filtered = achievements.filter((a) => {
    const matchCat = selectedCategory === 'ALL' || a.category === selectedCategory;
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'UNLOCKED' && a.isUnlocked) ||
      (statusFilter === 'LOCKED' && !a.isUnlocked);
    return matchCat && matchStatus;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />;
      case 'Trophy':
        return <Trophy className="h-4 w-4 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="h-4 w-4 text-primary" />;
      case 'Award':
        return <Award className="h-4 w-4 text-emerald-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="h-4 w-4 text-cyan-400" />;
      case 'Target':
        return <Target className="h-4 w-4 text-rose-400" />;
      case 'Clock':
        return <Clock className="h-4 w-4 text-primary" />;
      case 'Zap':
        return <Zap className="h-4 w-4 text-amber-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Achievement & Milestones Gallery"
      description="Inspect your full collection of habit milestones, consistency tiers, and digital honors."
      icon={Trophy}
      iconColor="#F59E0B"
      size="lg"
    >
      <div className="space-y-4 text-left">
        {/* Category & Status Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
          <div className="flex flex-wrap gap-1 bg-surface-sunken p-1 rounded-xl border border-border text-[10px] font-bold">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all cursor-pointer select-none',
                  selectedCategory === cat
                    ? 'bg-primary text-white font-extrabold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-surface-sunken p-1 rounded-xl border border-border text-[10px] font-bold">
            {(['ALL', 'UNLOCKED', 'LOCKED'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all cursor-pointer select-none',
                  statusFilter === s
                    ? 'bg-surface-elevated text-foreground font-extrabold shadow-sm border border-border/70'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {filtered.map((ach) => (
            <div
              key={ach.id}
              onClick={() => ach.isUnlocked && onSelectAchievement?.(ach)}
              className={cn(
                'p-3.5 rounded-2xl border transition-all text-xs font-semibold flex flex-col justify-between gap-3',
                ach.isUnlocked
                  ? 'bg-surface-elevated/90 border-border/90 hover:border-primary/50 cursor-pointer shadow-sm'
                  : 'bg-surface-sunken/50 border-border/40 opacity-70'
              )}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm',
                      ach.isUnlocked
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-surface-sunken border-border/60 text-muted-foreground'
                    )}
                  >
                    {ach.isUnlocked ? getIcon(ach.icon) : <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-foreground font-bold truncate leading-tight">
                        {ach.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    'text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0',
                    ach.rarity === 'LEGENDARY'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : ach.rarity === 'EPIC'
                      ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                      : ach.rarity === 'RARE'
                      ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  )}
                >
                  {ach.rarity}
                </span>
              </div>

              {/* Progress or Unlocked Status */}
              <div className="pt-2 border-t border-border/50">
                {ach.isUnlocked ? (
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Unlocked · {ach.tier}</span>
                    </span>
                    <span className="text-muted-foreground font-mono text-[9px]">
                      {ach.unlockedAt ? new Date(ach.unlockedAt).toLocaleDateString() : 'Achieved'}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>Progress: {ach.currentValue} / {ach.threshold}</span>
                      <span className="font-mono font-bold text-foreground">{ach.progress}%</span>
                    </div>
                    <ProgressBar value={ach.progress} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
};
