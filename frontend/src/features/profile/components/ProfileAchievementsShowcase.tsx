import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProfileAchievementItem } from '@/types/profile';
import { Award, ArrowRight, Flame, Sparkles, Brain, Sunrise, Trophy, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileAchievementsShowcaseProps {
  unlocked?: ProfileAchievementItem[];
  totalUnlocked?: number;
  totalAvailable?: number;
}

const getAchievementIcon = (code = '') => {
  const c = code.toUpperCase();
  if (c.includes('STREAK')) return <Flame className="h-5 w-5 text-warning" />;
  if (c.includes('FOCUS') || c.includes('BRAIN')) return <Brain className="h-5 w-5 text-ai" />;
  if (c.includes('MORNING') || c.includes('EARLY')) return <Sunrise className="h-5 w-5 text-amber-500" />;
  if (c.includes('FORGE') || c.includes('SCORE')) return <Zap className="h-5 w-5 text-primary" />;
  if (c.includes('GOAL') || c.includes('CHAMPION')) return <Trophy className="h-5 w-5 text-yellow-500" />;
  return <Sparkles className="h-5 w-5 text-primary" />;
};

export const ProfileAchievementsShowcase: React.FC<ProfileAchievementsShowcaseProps> = ({
  unlocked = [],
  totalUnlocked = 0,
  totalAvailable = 12,
}) => {
  const safeUnlocked = Array.isArray(unlocked) ? unlocked : [];

  return (
    <Card className="p-6 bg-surface-elevated border-border shadow-card space-y-5">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Earned Milestones &amp; Badges
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalUnlocked} of {totalAvailable} milestones unlocked
          </p>
        </div>
        <Link
          to="/dashboard?tab=milestones"
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
        >
          All Milestones <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {safeUnlocked.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-bold text-foreground">Your Forge is just getting started.</p>
            <p>Complete your daily routines to unlock your first achievements!</p>
          </div>
        ) : (
          safeUnlocked.map((ach, idx) => {
            const code = ach.code || `ach-${idx}`;
            let dateStr = '';
            if (ach.unlockedAt) {
              try {
                dateStr = new Date(ach.unlockedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              } catch (_) {
                dateStr = '';
              }
            }

            return (
              <div
                key={code}
                className="p-4 rounded-xl bg-surface border border-border/70 flex items-start gap-3.5 hover:border-primary/40 transition-all group"
              >
                <div className="h-11 w-11 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  {getAchievementIcon(code)}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-black text-foreground truncate">{ach.title || 'Achievement'}</h4>
                    <Badge variant="outline" size="sm" className="text-[9px] font-black uppercase tracking-wider shrink-0">
                      {ach.tier || 'BRONZE'}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {ach.description || 'Milestone achieved.'}
                  </p>

                  {dateStr && (
                    <span className="text-[9px] font-bold text-success block pt-0.5">
                      Unlocked {dateStr}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
