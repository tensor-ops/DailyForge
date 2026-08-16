import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Sliders, Palette, Bot, Calendar, Clock, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeLogo } from '@/components/brand/ThemeLogo';
import { useTheme } from '@/hooks/useTheme';

interface ProfilePreferencesCardProps {
  preferences?: Record<string, any>;
  timezone: string;
  language: string;
}

export const ProfilePreferencesCard: React.FC<ProfilePreferencesCardProps> = ({
  preferences = {},
  timezone,
  language,
}) => {
  const { currentTheme } = useTheme();

  return (
    <Card className="p-6 bg-surface-elevated border-border shadow-card space-y-5">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            System &amp; Personalization Settings
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">How Daily Forge operates for your lifestyle</p>
        </div>
        <Link
          to="/settings"
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
        >
          Manage All Settings <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
        {/* Theme */}
        <div className="p-3.5 rounded-xl bg-surface border border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Palette className="h-4 w-4 text-primary" />
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Active Theme</span>
              <span className="font-bold text-foreground capitalize">{currentTheme.replace('-', ' ')}</span>
            </div>
          </div>
          <ThemeLogo variant="icon" size="sm" />
        </div>

        {/* AI Coaching Style */}
        <div className="p-3.5 rounded-xl bg-surface border border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bot className="h-4 w-4 text-ai" />
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">AI Coach Style</span>
              <span className="font-bold text-foreground capitalize">{preferences.aiCoachingStyle || 'Balanced'}</span>
            </div>
          </div>
          <Badge variant="ai" size="sm" className="text-[9px] uppercase font-extrabold">
            Active
          </Badge>
        </div>

        {/* Week Start */}
        <div className="p-3.5 rounded-xl bg-surface border border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-emerald-500" />
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Week Starts On</span>
              <span className="font-bold text-foreground capitalize">{preferences.weekStartsOn || 'Monday'}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground">Standard</span>
        </div>

        {/* Timezone */}
        <div className="p-3.5 rounded-xl bg-surface border border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="h-4 w-4 text-blue-500" />
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Timezone</span>
              <span className="font-bold text-foreground truncate max-w-[120px] block">{timezone || 'UTC'}</span>
            </div>
          </div>
        </div>

        {/* Daily Reminder */}
        <div className="p-3.5 rounded-xl bg-surface border border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-amber-500" />
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Morning Briefing</span>
              <span className="font-bold text-foreground">{preferences.dailyReminderTime || '08:00 AM'}</span>
            </div>
          </div>
          <Badge variant="outline" size="sm" className="text-[9px] font-bold text-success">
            Enabled
          </Badge>
        </div>

        {/* Language */}
        <div className="p-3.5 rounded-xl bg-surface border border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="h-4 w-4 text-purple-500" />
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Language</span>
              <span className="font-bold text-foreground uppercase">{language || 'EN'} (English)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
