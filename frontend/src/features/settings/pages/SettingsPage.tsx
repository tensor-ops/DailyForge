import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Sun, Moon, Laptop, Trash2, User, Eye, Shield, Bell, Database, Target, Sparkles } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/utils/cn';

export const SettingsPage: React.FC = () => {
  useDocumentTitle('DailyForge — Settings');
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { success, info } = useToast();

  // Profile states
  const [name, setName] = useState(user?.name || 'Developer');
  const [timezone, setTimezone] = useState('GMT -5 (EST)');

  // Preferences states
  const [weekStarts, setWeekStarts] = useState<'sunday' | 'monday'>('monday');
  const [dateFormat, setDateFormat] = useState<'MM/DD/YYYY' | 'DD/MM/YYYY'>('MM/DD/YYYY');
  const [defaultDuration, setDefaultDuration] = useState('30m');

  // Habit preferences states
  const [defaultReminder, setDefaultReminder] = useState('10m before');
  const [difficultyPref, setDifficultyPref] = useState<'normal' | 'strict'>('normal');

  // Intelligence states
  const [personalization, setPersonalization] = useState(true);
  const [coachActive, setCoachActive] = useState(true);
  const [insightFrequency, setInsightFrequency] = useState<'low' | 'balanced' | 'high'>('balanced');

  // Privacy integrations
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [wearablesConnected, setWearablesConnected] = useState(false);
  const [contextSignals, setContextSignals] = useState(false);

  // Notification states
  const [habitReminders, setHabitReminders] = useState(true);
  const [goalReminders, setGoalReminders] = useState(true);
  const [weeklyReview, setWeeklyReview] = useState(true);
  const [insightNotifs, setInsightNotifs] = useState(false);

  const handleSaveSettings = () => {
    success('Settings saved', 'Your Daily Forge configurations have been stored.');
  };

  const handleExportData = () => {
    info('Exporting data', 'Your habit logs are downloading in JSON format.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in pb-12">
      <PageHeader
        title="Settings"
        description="Control your Daily Forge experience."
      />

      {/* 1. PROFILE SECTION */}
      <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/10 pb-2">
          <User className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Profile Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-muted-foreground block font-bold">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1D293D] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-muted-foreground block font-bold">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1D293D] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-primary/50"
            >
              <option value="GMT -5 (EST)">GMT -5 (EST)</option>
              <option value="GMT +0 (UTC)">GMT +0 (UTC)</option>
              <option value="GMT +5:30 (IST)">GMT +5:30 (IST)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 2. GENERAL PREFERENCES */}
      <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/10 pb-2">
          <Eye className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Display & General</h3>
        </div>

        {/* Theme mode buttons */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground block font-bold">Theme Mode</label>
          <div className="grid grid-cols-3 gap-3 text-xs font-bold">
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer",
                theme === 'dark' ? "border-primary bg-primary/10 text-primary" : "border-[#1D293D] hover:bg-[#131B29] text-muted-foreground"
              )}
            >
              <Moon className="h-4.5 w-4.5" />
              <span>Dark (Default)</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={cn(
                "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer",
                theme === 'light' ? "border-primary bg-primary/10 text-primary" : "border-[#1D293D] hover:bg-[#131B29] text-muted-foreground"
              )}
            >
              <Sun className="h-4.5 w-4.5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer",
                theme === 'system' ? "border-primary bg-primary/10 text-primary" : "border-[#1D293D] hover:bg-[#131B29] text-muted-foreground"
              )}
            >
              <Laptop className="h-4.5 w-4.5" />
              <span>System</span>
            </button>
          </div>
        </div>

        {/* Calendar and formatting preferences */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold pt-2">
          <div className="space-y-1.5">
            <label className="text-muted-foreground block font-bold">Week Starts On</label>
            <select
              value={weekStarts}
              onChange={(e) => setWeekStarts(e.target.value as any)}
              className="w-full bg-[#080C14] border border-[#1D293D] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-primary/50 font-bold"
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
              className="w-full bg-[#080C14] border border-[#1D293D] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-primary/50 font-bold"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-muted-foreground block font-bold">Default Time block</label>
            <select
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1D293D] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-primary/50 font-bold"
            >
              <option value="15m">15 Minutes</option>
              <option value="30m">30 Minutes</option>
              <option value="1h">1 Hour</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 3. HABIT PREFERENCES */}
      <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/10 pb-2">
          <Target className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Habit Configurations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-muted-foreground block font-bold">Default Habit Duration</label>
            <select
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1D293D] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-primary/50 font-bold"
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
              className="w-full bg-[#080C14] border border-[#1D293D] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-primary/50 font-bold"
            >
              <option value="at start">At Start</option>
              <option value="10m before">10m Before</option>
              <option value="30m before">30m Before</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-muted-foreground block font-bold">Difficulty Offset</label>
            <select
              value={difficultyPref}
              onChange={(e) => setDifficultyPref(e.target.value as any)}
              className="w-full bg-[#080C14] border border-[#1D293D] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-primary/50 font-bold"
            >
              <option value="normal">Normal (default baseline)</option>
              <option value="strict">Strict (decreases skip buffers)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 4. AI & INTELLIGENCE */}
      <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-border/10 pb-2">
          <Sparkles className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Intelligence Settings</h3>
        </div>

        <div className="space-y-4 text-xs font-semibold text-slate-300">
          <div className="flex items-center justify-between p-3 bg-[#131B29] border border-border/5 rounded-xl">
            <div>
              <span className="text-slate-100 block font-bold">Personalization Engine</span>
              <span className="text-[10px] text-muted-foreground">Authorize Daily Forge to map correlations between separate habits.</span>
            </div>
            <button
              onClick={() => setPersonalization(!personalization)}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer",
                personalization ? "bg-primary border-primary text-slate-100" : "bg-[#080C14] border-[#1D293D] text-muted-foreground"
              )}
            >
              {personalization ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#131B29] border border-border/5 rounded-xl">
            <div>
              <span className="text-slate-100 block font-bold">Forge Coach Assistant</span>
              <span className="text-[10px] text-muted-foreground">Authorize chat coach dialogue and scheduling recommendations.</span>
            </div>
            <button
              onClick={() => setCoachActive(!coachActive)}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer",
                coachActive ? "bg-primary border-primary text-slate-100" : "bg-[#080C14] border-[#1D293D] text-muted-foreground"
              )}
            >
              {coachActive ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#131B29] border border-border/5 rounded-xl">
            <div>
              <span className="text-slate-100 block font-bold font-extrabold">Insight Frequency</span>
              <span className="text-[10px] text-muted-foreground">Control delivery intervals for behavioral cards.</span>
            </div>
            <div className="flex gap-1 bg-[#080C14] p-1 border border-[#1D293D] rounded-lg">
              {(['low', 'balanced', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setInsightFrequency(lvl)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer",
                    insightFrequency === lvl ? "bg-primary text-slate-100" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 5. PRIVACY & DATA INTEGRATIONS */}
      <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/10 pb-2">
          <Shield className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Data Privacy & Integrations</h3>
        </div>

        <div className="space-y-3.5 text-xs font-semibold text-slate-300">
          <div className="flex items-center justify-between p-3 bg-[#131B29] border border-border/5 rounded-xl">
            <span className="text-slate-200">Google Calendar integration (Opt-in)</span>
            <button
              onClick={() => setCalendarConnected(!calendarConnected)}
              className={cn(
                "px-2.5 py-1 rounded border text-[10px] font-bold uppercase transition-colors cursor-pointer",
                calendarConnected ? "bg-success border-success text-slate-100" : "bg-[#080C14] border-[#1D293D] text-muted-foreground"
              )}
            >
              {calendarConnected ? 'Connected' : 'Connect'}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#131B29] border border-border/5 rounded-xl">
            <span className="text-slate-200">Apple Health / Fitbit Wearables integration (Opt-in)</span>
            <button
              onClick={() => setWearablesConnected(!wearablesConnected)}
              className={cn(
                "px-2.5 py-1 rounded border text-[10px] font-bold uppercase transition-colors cursor-pointer",
                wearablesConnected ? "bg-success border-success text-slate-100" : "bg-[#080C14] border-[#1D293D] text-muted-foreground"
              )}
            >
              {wearablesConnected ? 'Connected' : 'Connect'}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#131B29] border border-border/5 rounded-xl">
            <span className="text-slate-200">Contextual focus workspace signals (Opt-in)</span>
            <button
              onClick={() => setContextSignals(!contextSignals)}
              className={cn(
                "px-2.5 py-1 rounded border text-[10px] font-bold uppercase transition-colors cursor-pointer",
                contextSignals ? "bg-success border-success text-slate-100" : "bg-[#080C14] border-[#1D293D] text-muted-foreground"
              )}
            >
              {contextSignals ? 'Connected' : 'Connect'}
            </button>
          </div>
        </div>
      </Card>

      {/* 6. NOTIFICATION CHANNELS */}
      <Card className="bg-[#101622] border border-[#1D293D] rounded-[14px] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/10 pb-2">
          <Bell className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Notification Channels</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
          <div className="flex items-center justify-between p-3 bg-[#131B29] border border-border/5 rounded-xl">
            <span>Habit reminders</span>
            <button
              onClick={() => setHabitReminders(!habitReminders)}
              className={cn(
                "px-2.5 py-1 rounded border text-[10px] font-bold uppercase transition-colors cursor-pointer",
                habitReminders ? "bg-primary border-primary text-slate-100" : "bg-[#080C14] border-[#1D293D] text-muted-foreground"
              )}
            >
              {habitReminders ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#131B29] border border-border/5 rounded-xl">
            <span>Goal notifications</span>
            <button
              onClick={() => setGoalReminders(!goalReminders)}
              className={cn(
                "px-2.5 py-1 rounded border text-[10px] font-bold uppercase transition-colors cursor-pointer",
                goalReminders ? "bg-primary border-primary text-slate-100" : "bg-[#080C14] border-[#1D293D] text-muted-foreground"
              )}
            >
              {goalReminders ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#131B29] border border-border/5 rounded-xl">
            <span>Weekly scorecard reviews</span>
            <button
              onClick={() => setWeeklyReview(!weeklyReview)}
              className={cn(
                "px-2.5 py-1 rounded border text-[10px] font-bold uppercase transition-colors cursor-pointer",
                weeklyReview ? "bg-primary border-primary text-slate-100" : "bg-[#080C14] border-[#1D293D] text-muted-foreground"
              )}
            >
              {weeklyReview ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#131B29] border border-border/5 rounded-xl">
            <span>AI Coach Insight pushes</span>
            <button
              onClick={() => setInsightNotifs(!insightNotifs)}
              className={cn(
                "px-2.5 py-1 rounded border text-[10px] font-bold uppercase transition-colors cursor-pointer",
                insightNotifs ? "bg-primary border-primary text-slate-100" : "bg-[#080C14] border-[#1D293D] text-muted-foreground"
              )}
            >
              {insightNotifs ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </Card>

      {/* 7. DATA EXPORTS & ACCOUNT DANGER ZONE */}
      <Card className="bg-[#101622] border border-danger/20 rounded-[14px] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-danger/10 pb-2">
          <Database className="h-4.5 w-4.5 text-danger animate-pulse" />
          <h3 className="text-sm font-bold text-danger">Data Management & Danger Zone</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-bold pt-1">
          <button
            onClick={handleExportData}
            className="bg-[#131B29] hover:bg-[#151D2C] border border-[#1D293D] text-slate-200 px-4 py-2.5 rounded-xl cursor-pointer"
          >
            Export All Tracker Data (JSON)
          </button>
          <button
            onClick={() => info('Delete request logged', 'Verification email sent to confirm data removal.')}
            className="bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account & Data</span>
          </button>
        </div>
      </Card>

      {/* Save Settings Trigger Button */}
      <div className="pt-2 text-right">
        <button
          onClick={handleSaveSettings}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
};
