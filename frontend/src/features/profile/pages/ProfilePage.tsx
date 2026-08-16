import React, { useCallback, useEffect, useState } from 'react';
import { profileService } from '@/services/profileService';
import { CompleteProfileResponse } from '@/types/profile';
import { ProfileHero } from '../components/ProfileHero';
import { ProfilePerformanceGrid } from '../components/ProfilePerformanceGrid';
import { HabitIdentityCard } from '../components/HabitIdentityCard';
import { HabitCategoryBreakdownCard } from '../components/HabitCategoryBreakdownCard';
import { ConsistencyHistoryHeatmap } from '../components/ConsistencyHistoryHeatmap';
import { PersonalRecordsCard } from '../components/PersonalRecordsCard';
import { ProfileAchievementsShowcase } from '../components/ProfileAchievementsShowcase';
import { ProfileGoalsSummary } from '../components/ProfileGoalsSummary';
import { ProfilePlannerSummary } from '../components/ProfilePlannerSummary';
import { ProfileAIProfileCard } from '../components/ProfileAIProfileCard';
import { ProfilePreferencesCard } from '../components/ProfilePreferencesCard';
import { ProfileAccountSecurity } from '../components/ProfileAccountSecurity';
import { EditProfileModal } from '../components/EditProfileModal';
import { Loader } from '@/components/ui/Loader';
import { AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CompleteProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleExportData = async () => {
    try {
      const blob = await profileService.exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dailyforge-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader size="lg" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading your Forge profile…
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center p-4">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-foreground">Profile Unavailable</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            {error || 'An unexpected error occurred loading your profile.'}
          </p>
        </div>
        <button
          onClick={fetchProfile}
          className="text-sm font-bold text-primary hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { user, identity, performance, habitIdentity, consistencyHistory, personalRecords, achievements, goalsSummary, plannerSummary, aiProfile, preferences } = profile;

  return (
    <div className="min-h-screen bg-background">
      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSaved={fetchProfile}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ── 1. Profile Hero ── */}
        <ProfileHero
          user={user}
          identity={identity}
          onEditProfile={() => setShowEditModal(true)}
          onExportData={handleExportData}
        />

        {/* ── 2. Performance Engine (4-column grid) ── */}
        <ProfilePerformanceGrid performance={performance} />

        {/* ── 3. Consistency History Heatmap (full width) ── */}
        <ConsistencyHistoryHeatmap
          history={consistencyHistory}
          currentStreak={user.currentStreak}
          longestStreak={user.longestStreak}
        />

        {/* ── 4. Habit Identity + Category Breakdown (2 cols) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HabitIdentityCard habitIdentity={habitIdentity} />
          <HabitCategoryBreakdownCard categories={habitIdentity.categoryBreakdown} />
        </div>

        {/* ── 5. Personal Records (full width) ── */}
        <PersonalRecordsCard records={personalRecords} />

        {/* ── 6. Achievements Showcase (full width) ── */}
        <ProfileAchievementsShowcase
          unlocked={achievements.unlocked}
          totalUnlocked={achievements.totalUnlocked}
          totalAvailable={achievements.totalAvailable}
        />

        {/* ── 7. Goals + Planner + AI Coach (3-column grid) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProfileGoalsSummary goals={goalsSummary} />
          <ProfilePlannerSummary planner={plannerSummary} />
          <ProfileAIProfileCard aiProfile={aiProfile} />
        </div>

        {/* ── 8. Preferences ── */}
        <ProfilePreferencesCard
          preferences={preferences}
          timezone={user.timezone}
          language={user.language}
        />

        {/* ── 9. Account & Security ── */}
        <ProfileAccountSecurity
          email={user.email}
          onExportData={handleExportData}
        />

        {/* Footer spacing */}
        <div className="h-6" />
      </div>
    </div>
  );
};

export default ProfilePage;
