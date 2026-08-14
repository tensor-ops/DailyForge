import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Modal } from '@/components/ui/Modal';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Sun, Moon, Laptop, Trash2 } from 'lucide-react';

import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const SettingsPage: React.FC = () => {
  useDocumentTitle('DailyForge — Settings');
  const { theme, setTheme } = useTheme();
  const { user, updateUserPreferences } = useAuth();
  const { success, info } = useToast();

  const [emailNotifs, setEmailNotifs] = useState(user?.preferences?.emailNotifications ?? true);
  const [aiInsights, setAiInsights] = useState(user?.preferences?.aiInsightsEnabled ?? true);
  const [weeklyReport, setWeeklyReport] = useState(user?.preferences?.weeklyReportEnabled ?? true);

  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);

  const handleSavePreferences = () => {
    updateUserPreferences({
      emailNotifications: emailNotifs,
      aiInsightsEnabled: aiInsights,
      weeklyReportEnabled: weeklyReport,
    });
    success('Settings updated', 'Your preferences have been saved.');
  };

  const handleResetDemoData = () => {
    localStorage.removeItem('ai_habit_items');
    setIsClearDataModalOpen(false);
    info('Demo data reset', 'Default habit data will reload.');
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        description="Configure appearance, notifications, and application preferences."
      />

      {/* 1. APPEARANCE */}
      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">Appearance</h3>
          <p className="text-xs text-muted-foreground">
            Select how DailyForge looks to you. Choose between sleek Dark Mode, crisp Light Mode, or system default.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2.5 transition-all text-xs font-medium ${
              theme === 'dark'
                ? 'border-primary bg-primary/10 text-primary font-semibold shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Moon className="h-5 w-5" />
            <span>Dark (Default)</span>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2.5 transition-all text-xs font-medium ${
              theme === 'light'
                ? 'border-primary bg-primary/10 text-primary font-semibold shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Sun className="h-5 w-5" />
            <span>Light</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2.5 transition-all text-xs font-medium ${
              theme === 'system'
                ? 'border-primary bg-primary/10 text-primary font-semibold shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Laptop className="h-5 w-5" />
            <span>System</span>
          </button>
        </div>
      </Card>

      {/* 2. NOTIFICATIONS */}
      <Card className="p-6 space-y-5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">Notifications & Alerts</h3>
          <p className="text-xs text-muted-foreground">
            Manage daily check-in reminders and AI pattern delivery.
          </p>
        </div>

        <div className="divide-y divide-border/60">
          <div className="py-3">
            <Switch
              label="Daily Habit Reminder"
              description="Receive reminders at your designated start times"
              checked={emailNotifs}
              onChange={setEmailNotifs}
            />
          </div>

          <div className="py-3">
            <Switch
              label="Neural AI Coach Alerts"
              description="Get proactive nudges when consistency friction is identified"
              checked={aiInsights}
              onChange={setAiInsights}
            />
          </div>

          <div className="py-3">
            <Switch
              label="Weekly Momentum Summary"
              description="Receive a weekly scorecard detailing streaks and completion rates"
              checked={weeklyReport}
              onChange={setWeeklyReport}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button size="sm" onClick={handleSavePreferences}>
            Save Notification Preferences
          </Button>
        </div>
      </Card>

      {/* 3. DANGER ZONE */}
      <Card className="p-6 space-y-4 border-danger/30 bg-danger/5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-danger">Reset / Danger Zone</h3>
          <p className="text-xs text-muted-foreground">
            Reset local demo habits and restore initial state.
          </p>
        </div>

        <div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsClearDataModalOpen(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Reset Demo Data
          </Button>
        </div>
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isClearDataModalOpen}
        onClose={() => setIsClearDataModalOpen(false)}
        title="Reset All Habit Data?"
        description="This will clear your local tracker and restore the initial demonstration habits."
      >
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsClearDataModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleResetDemoData}
          >
            Reset Now
          </Button>
        </div>
      </Modal>
    </div>
  );
};
