import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { ThemeStudio } from '../components/ThemeStudio/ThemeStudio';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  Palette,
  User,
  Eye,
  Shield,
  Bell,
  Database,
  Target,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/utils/cn';

type SettingsTab =
  | 'theme-studio'
  | 'profile'
  | 'general'
  | 'habits'
  | 'intelligence'
  | 'privacy'
  | 'notifications'
  | 'danger';

/* Helper: reusable settings row */
const SettingRow: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => (
  <div className="flex items-center justify-between p-3.5 bg-surface-elevated border border-border/60 rounded-xl gap-4">
    <div>
      <span className="text-xs text-foreground block font-bold">{label}</span>
      {description && <span className="text-[10px] text-muted-foreground">{description}</span>}
    </div>
    {children}
  </div>
);

/* Toggle button component */
const ToggleBtn: React.FC<{
  active: boolean;
  onToggle: () => void;
  activeLabel?: string;
  inactiveLabel?: string;
  activeVariant?: 'primary' | 'success';
}> = ({ active, onToggle, activeLabel = 'ACTIVE', inactiveLabel = 'OFF', activeVariant = 'primary' }) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      'px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer text-[10px] uppercase whitespace-nowrap shrink-0',
      active
        ? activeVariant === 'success'
          ? 'bg-success border-success text-success-foreground'
          : 'bg-primary border-primary text-primary-foreground'
        : 'bg-surface border-border text-muted-foreground hover:border-border-strong'
    )}
  >
    {active ? activeLabel : inactiveLabel}
  </button>
);

const selectCls =
  'w-full bg-input border border-input-border rounded-xl px-3.5 py-2.5 text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all cursor-pointer';

export const SettingsPage: React.FC = () => {
  useDocumentTitle('DailyForge — Theme Studio & Settings');
  const { user } = useAuth();
  const { success, info } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>('theme-studio');

  // Profile states
  const [name, setName] = useState(user?.name || 'Developer');
  const [timezone, setTimezone] = useState('GMT +5:30 (IST)');

  // General prefs
  const [weekStarts, setWeekStarts] = useState<'sunday' | 'monday'>('monday');
  const [dateFormat, setDateFormat] = useState<'MM/DD/YYYY' | 'DD/MM/YYYY'>('MM/DD/YYYY');
  const [defaultDuration, setDefaultDuration] = useState('30m');

  // Habit preferences
  const [defaultReminder, setDefaultReminder] = useState('10m before');
  const [difficultyPref, setDifficultyPref] = useState<'normal' | 'strict'>('normal');

  // Intelligence
  const [personalization, setPersonalization] = useState(true);
  const [coachActive, setCoachActive] = useState(true);
  const [insightFrequency, setInsightFrequency] = useState<'low' | 'balanced' | 'high'>('balanced');

  // Integrations
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [wearablesConnected, setWearablesConnected] = useState(false);
  const [contextSignals, setContextSignals] = useState(false);

  // Notifications
  const [habitReminders, setHabitReminders] = useState(true);
  const [goalReminders, setGoalReminders] = useState(true);
  const [weeklyReview, setWeeklyReview] = useState(true);
  const [insightNotifs, setInsightNotifs] = useState(false);

  const handleSave = () =>
    success('Settings Saved', 'Your DailyForge configurations have been stored.');

  const tabList = [
    { id: 'theme-studio' as SettingsTab, label: 'Theme Studio', icon: Palette, badge: 'Flagship' },
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'general' as SettingsTab, label: 'General & Display', icon: Eye },
    { id: 'habits' as SettingsTab, label: 'Habit Rules', icon: Target },
    { id: 'intelligence' as SettingsTab, label: 'AI Intelligence', icon: Sparkles },
    { id: 'privacy' as SettingsTab, label: 'Integrations', icon: Shield },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'danger' as SettingsTab, label: 'Data & Backup', icon: Database },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in pb-16">
      <PageHeader
        title="Settings & Theme Studio"
        description="Personalize DailyForge's visual personality, habit algorithms, intelligence modules, and workspace preferences."
      />

      {/* Top Tab Bar Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-border/50">
        {tabList.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer select-none',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'bg-surface-elevated border border-border/80 text-muted-foreground hover:text-foreground hover:bg-card-hover'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={cn(
                  'text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase',
                  isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Theme Studio */}
      {activeTab === 'theme-studio' && <ThemeStudio />}

      {/* Tab 2: Profile */}
      {activeTab === 'profile' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <User className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Profile &amp; Account Identity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="space-y-1.5">
              <label className="text-muted-foreground block font-bold">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={selectCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground block font-bold">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={selectCls}
              >
                <option value="GMT -5 (EST)">GMT -5 (EST)</option>
                <option value="GMT +0 (UTC)">GMT +0 (UTC)</option>
                <option value="GMT +5:30 (IST)">GMT +5:30 (IST)</option>
              </select>
            </div>
          </div>
          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={handleSave}
              className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </Card>
      )}

      {/* Tab 3: General & Display */}
      {activeTab === 'general' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <Eye className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">General &amp; Calendar Display</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="space-y-1.5">
              <label className="text-muted-foreground block font-bold">Week Starts On</label>
              <select
                value={weekStarts}
                onChange={(e) => setWeekStarts(e.target.value as any)}
                className={selectCls}
              >
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground block font-bold">Date Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as any)}
                className={selectCls}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground block font-bold">Default Time Block</label>
              <select
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                className={selectCls}
              >
                <option value="15m">15 Minutes</option>
                <option value="30m">30 Minutes</option>
                <option value="1h">1 Hour</option>
              </select>
            </div>
          </div>
          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={handleSave}
              className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Save Display Preferences
            </button>
          </div>
        </Card>
      )}

      {/* Tab 4: Habit Rules */}
      {activeTab === 'habits' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <Target className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Habit Execution &amp; Difficulty Rules</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="space-y-1.5">
              <label className="text-muted-foreground block font-bold">Default Duration</label>
              <select
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                className={selectCls}
              >
                <option value="15m">15m</option>
                <option value="30m">30m</option>
                <option value="1h">1h</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground block font-bold">Default Reminder Offset</label>
              <select
                value={defaultReminder}
                onChange={(e) => setDefaultReminder(e.target.value)}
                className={selectCls}
              >
                <option value="at start">At Start</option>
                <option value="10m before">10m Before</option>
                <option value="30m before">30m Before</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-muted-foreground block font-bold">Difficulty Mode</label>
              <select
                value={difficultyPref}
                onChange={(e) => setDifficultyPref(e.target.value as any)}
                className={selectCls}
              >
                <option value="normal">Normal (Standard buffer)</option>
                <option value="strict">Strict (Zero grace periods)</option>
              </select>
            </div>
          </div>
          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={handleSave}
              className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Save Habit Rules
            </button>
          </div>
        </Card>
      )}

      {/* Tab 5: AI Intelligence */}
      {activeTab === 'intelligence' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">AI Intelligence &amp; Autonomous Coach</h3>
          </div>
          <div className="space-y-3">
            <SettingRow
              label="Personalization Engine"
              description="Authorize DailyForge to calculate correlations between routines and recovery."
            >
              <ToggleBtn
                active={personalization}
                onToggle={() => setPersonalization(!personalization)}
              />
            </SettingRow>
            <SettingRow
              label="Forge Coach Assistant"
              description="Authorize multi-turn chat dialogues, schedule suggestions, and friction analysis."
            >
              <ToggleBtn active={coachActive} onToggle={() => setCoachActive(!coachActive)} />
            </SettingRow>
            <SettingRow
              label="Insight Delivery Frequency"
              description="Adjust frequency of proactive behavioral recommendations."
            >
              <div className="flex gap-1 bg-surface-sunken p-1 border border-border rounded-lg shrink-0">
                {(['low', 'balanced', 'high'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setInsightFrequency(lvl)}
                    className={cn(
                      'px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer',
                      insightFrequency === lvl
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </SettingRow>
          </div>
          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={handleSave}
              className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Save Intelligence Settings
            </button>
          </div>
        </Card>
      )}

      {/* Tab 6: Integrations */}
      {activeTab === 'privacy' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <Shield className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Data Privacy &amp; Integrations</h3>
          </div>
          <div className="space-y-3">
            <SettingRow label="Google Calendar integration (Opt-in)">
              <ToggleBtn
                active={calendarConnected}
                onToggle={() => setCalendarConnected(!calendarConnected)}
                activeLabel="Connected"
                inactiveLabel="Connect"
                activeVariant="success"
              />
            </SettingRow>
            <SettingRow label="Apple Health / Fitbit Wearables integration (Opt-in)">
              <ToggleBtn
                active={wearablesConnected}
                onToggle={() => setWearablesConnected(!wearablesConnected)}
                activeLabel="Connected"
                inactiveLabel="Connect"
                activeVariant="success"
              />
            </SettingRow>
            <SettingRow label="Contextual focus workspace signals (Opt-in)">
              <ToggleBtn
                active={contextSignals}
                onToggle={() => setContextSignals(!contextSignals)}
                activeLabel="Connected"
                inactiveLabel="Connect"
                activeVariant="success"
              />
            </SettingRow>
          </div>
        </Card>
      )}

      {/* Tab 7: Notifications */}
      {activeTab === 'notifications' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <Bell className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Notification Channels</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SettingRow label="Habit Reminders">
              <ToggleBtn
                active={habitReminders}
                onToggle={() => setHabitReminders(!habitReminders)}
                activeLabel="ON"
                inactiveLabel="OFF"
              />
            </SettingRow>
            <SettingRow label="Goal Notifications">
              <ToggleBtn
                active={goalReminders}
                onToggle={() => setGoalReminders(!goalReminders)}
                activeLabel="ON"
                inactiveLabel="OFF"
              />
            </SettingRow>
            <SettingRow label="Weekly Scorecard Reviews">
              <ToggleBtn
                active={weeklyReview}
                onToggle={() => setWeeklyReview(!weeklyReview)}
                activeLabel="ON"
                inactiveLabel="OFF"
              />
            </SettingRow>
            <SettingRow label="AI Coach Pushes">
              <ToggleBtn
                active={insightNotifs}
                onToggle={() => setInsightNotifs(!insightNotifs)}
                activeLabel="ON"
                inactiveLabel="OFF"
              />
            </SettingRow>
          </div>
        </Card>
      )}

      {/* Tab 8: Danger Zone & Backup */}
      {activeTab === 'danger' && (
        <Card className="p-6 space-y-4 border-danger/20">
          <div className="flex items-center gap-2 border-b border-danger/20 pb-2">
            <Database className="h-4.5 w-4.5 text-danger animate-pulse" />
            <h3 className="text-sm font-bold text-danger">Data Management &amp; Danger Zone</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Download a full JSON backup of all your habits, goals, focus blocks, and telemetry records, or delete your account.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold pt-1">
            <button
              type="button"
              onClick={() =>
                info('Exporting Data', 'Your habit logs are downloading in JSON format.')
              }
              className="bg-surface-elevated hover:bg-muted border border-border text-foreground px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
            >
              Export All Tracker Data (JSON)
            </button>
            <button
              type="button"
              onClick={() =>
                info(
                  'Delete Request Logged',
                  'Verification email sent to confirm data removal.'
                )
              }
              className="bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Account &amp; Data</span>
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};
