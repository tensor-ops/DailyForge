import React from 'react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProfileUserData, UserForgeIdentity } from '@/types/profile';
import {
  Flame,
  Zap,
  Calendar,
  Sparkles,
  Edit3,
  Download,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface ProfileHeroProps {
  user: ProfileUserData;
  identity: UserForgeIdentity;
  onEditProfile: () => void;
  onExportData: () => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  user,
  identity,
  onEditProfile,
  onExportData,
}) => {
  return (
    <Card className="relative overflow-hidden p-6 sm:p-8 bg-surface-elevated border-border shadow-card">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
        {/* Left Column: Avatar + Core Identity */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar Container */}
          <div className="relative group shrink-0">
            <Avatar
              name={user.name}
              size="lg"
              className="h-24 w-24 sm:h-28 sm:w-28 text-2xl sm:text-3xl font-extrabold ring-4 ring-primary/20 shadow-elevated"
            />
            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xs shadow-md border-2 border-surface">
              {identity.level}
            </div>
          </div>

          {/* Name & Titles */}
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {user.name}
              </h1>

              <Badge variant="default" size="sm" className="font-bold">
                <Sparkles className="h-3 w-3 mr-1" />
                {identity.title}
              </Badge>

              <Badge variant="default" size="sm" className="uppercase font-extrabold tracking-wider text-[10px]">
                <ShieldCheck className="h-3 w-3 mr-1 text-success" />
                {user.membershipTier === 'pro' ? 'PRO FORGER' : 'FORGER'}
              </Badge>
            </div>

            {/* Handle & Tagline */}
            <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground font-medium">
              <span>@{user.username || 'forger'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Member since {user.memberSince}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-primary">
                <Award className="h-3.5 w-3.5" />
                Level {identity.level} ({identity.experiencePoints.toLocaleString()} XP)
              </span>
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed max-w-md pt-1">
              {user.bio || identity.description}
            </p>
          </div>
        </div>

        {/* Right Column: Quick Stats Pill & Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end gap-3 w-full sm:w-auto shrink-0">
          {/* Quick Metrics Badge Container */}
          <div className="flex items-center gap-3 bg-surface border border-border/80 rounded-2xl p-2.5 px-4 shadow-subtle w-full sm:w-auto justify-around sm:justify-start">
            <div className="flex items-center gap-2 pr-3 border-r border-border/60">
              <div className="h-8 w-8 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                <Flame className="h-4.5 w-4.5 fill-warning" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Streak</span>
                <span className="text-sm font-black text-foreground">{user.currentStreak} Days</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-1">
              <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Zap className="h-4.5 w-4.5 fill-primary" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Forge Score</span>
                <span className="text-sm font-black text-foreground">742</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportData}
              className="flex-1 sm:flex-none text-xs font-bold gap-1.5"
              title="Export complete Daily Forge data as JSON"
            >
              <Download className="h-3.5 w-3.5" />
              Export Data
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onEditProfile}
              className="flex-1 sm:flex-none text-xs font-bold gap-1.5 shadow-sm"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
