import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { LandingPage } from '@/features/landing/pages/LandingPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardOverview } from '@/features/dashboard/pages/DashboardOverview';
import { TodayDashboard } from '@/features/dashboard/pages/TodayDashboard';
import { HabitsPage } from '@/features/habits/pages/HabitsPage';
import { AnalyticsPage } from '@/features/dashboard/pages/AnalyticsPage';
import { ForgeLabPage } from '@/features/dashboard/pages/ForgeLabPage';
import { HabitDetailPage } from '@/features/dashboard/pages/HabitDetailPage';
import { GoalsDashboard } from '@/features/dashboard/pages/GoalsDashboard';
import { GoalDetailPage } from '@/features/dashboard/pages/GoalDetailPage';
import { PlannerDashboard } from '@/features/dashboard/pages/PlannerDashboard';
import { AIPage } from '@/features/ai/pages/AIPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isOnboardingComplete = !!(user?.preferences?.focusAreas && user.preferences.focusAreas.length > 0);
  if (!isOnboardingComplete) {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
};

// Public route wrapper (redirects to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    const isOnboardingComplete = !!(user?.preferences?.focusAreas && user.preferences.focusAreas.length > 0);
    if (!isOnboardingComplete) {
      if (window.location.pathname === '/register') {
        return <>{children}</>;
      }
      return <Navigate to="/register" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Marketing Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Authenticated Application Shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="today" element={<TodayDashboard />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="habits/:id" element={<HabitDetailPage />} />
        <Route path="goals" element={<GoalsDashboard />} />
        <Route path="goals/:id" element={<GoalDetailPage />} />
        <Route path="planner" element={<PlannerDashboard />} />
        <Route path="calendar" element={<Navigate to="/planner" replace />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="forge-lab" element={<ForgeLabPage />} />
        <Route path="ai-insights" element={<AIPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
