import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProfileAIProfile } from '@/types/profile';
import { Sparkles, Bot, Clock, ArrowRight, Compass, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileAIProfileCardProps {
  aiProfile: ProfileAIProfile;
}

export const ProfileAIProfileCard: React.FC<ProfileAIProfileCardProps> = ({ aiProfile }) => {
  return (
    <Card className="p-6 bg-surface-elevated border-border shadow-card h-full flex flex-col justify-between space-y-5">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">AI Intelligence Profile</h3>
            <p className="text-xs text-muted-foreground">What your AI Coach has learned about your habits</p>
          </div>
        </div>

        <Badge variant="ai" size="sm" className="font-extrabold uppercase text-[10px] tracking-wider">
          <Sparkles className="h-3 w-3 mr-1" />
          {aiProfile.learningState} ({aiProfile.coveragePercentage}%)
        </Badge>
      </div>

      <div className="space-y-3 flex-1 text-xs">
        {/* Primary Focus */}
        <div className="p-3 rounded-xl bg-surface border border-border/60 flex items-start gap-2.5">
          <Compass className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Primary Habit Focus</span>
            <span className="font-bold text-foreground">{aiProfile.primaryFocus}</span>
          </div>
        </div>

        {/* Peak Window */}
        <div className="p-3 rounded-xl bg-surface border border-border/60 flex items-start gap-2.5">
          <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Optimal Focus Window</span>
            <span className="font-bold text-foreground">{aiProfile.peakWindow}</span>
          </div>
        </div>

        {/* Current Challenge */}
        <div className="p-3 rounded-xl bg-surface border border-border/60 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Current Friction Point</span>
            <span className="text-muted-foreground/90 font-medium">{aiProfile.currentChallenge}</span>
          </div>
        </div>

        {/* Current Recommendation */}
        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
            Coach Recommendation
          </span>
          <p className="text-xs text-foreground font-medium italic">
            "{aiProfile.currentRecommendation}"
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-border/40 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Style: <strong className="text-foreground">{aiProfile.coachingStyle}</strong>
        </span>
        <Link
          to="/dashboard?tab=ai-coach"
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
        >
          Open AI Coach <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
};
