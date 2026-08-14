import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Award,
  Sparkles,
  Mail,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Profile"
        description="Your personal habit identity, streak records, and behavioral achievements."
      />

      {/* Main Profile Card */}
      <Card className="p-6 bg-card border-border shadow-card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar name={user?.name || 'Alex Vance'} size="lg" className="h-20 w-20 text-xl" />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {user?.name || 'Alex Vance'}
              </h2>
              <Badge variant="ai" size="sm" className="w-fit mx-auto sm:mx-0">
                <Sparkles className="h-3 w-3 mr-1" /> Pro Member
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
              <Mail className="h-4 w-4" /> {user?.email || 'alex.vance@example.com'}
            </p>

            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="h-3.5 w-3.5" /> Member since {user?.joinedDate || 'January 2025'}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-warning">
            <Flame className="h-5 w-5 fill-warning" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Streak
            </span>
          </div>
          <div className="text-3xl font-extrabold text-foreground mt-2">
            {user?.currentStreak || 12} Days
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-primary">
            <Award className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Longest Streak
            </span>
          </div>
          <div className="text-3xl font-extrabold text-foreground mt-2">
            {user?.longestStreak || 28} Days
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Habits
            </span>
          </div>
          <div className="text-3xl font-extrabold text-foreground mt-2">
            {user?.totalHabitsCount || 5} Active
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-ai">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Consistency Score
            </span>
          </div>
          <div className="text-3xl font-extrabold text-foreground mt-2">
            {user?.overallCompletionRate || 84}%
          </div>
        </Card>
      </div>

      {/* Badges / Milestones */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Earned Milestones</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <h4 className="text-sm font-semibold text-foreground">14-Day Streak Master</h4>
              <p className="text-xs text-muted-foreground">Maintained daily hydration streak</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Early Riser</h4>
              <p className="text-xs text-muted-foreground">Completed 5 morning routines</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-ai/30 bg-ai/5 flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Deep Focus</h4>
              <p className="text-xs text-muted-foreground">25 study sessions logged</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
