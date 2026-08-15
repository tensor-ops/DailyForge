import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Sun, Moon, Laptop, Trash2, User, Eye, Shield, Bell, Database, Target, Sparkles, Palette, Check } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/utils/cn';
import { AccentTheme } from '@/context/ThemeContext';

/* ------------------------------------------------------------------ */
/* Helper: reusable settings row                                        */
/* ------------------------------------------------------------------ */
const SettingRow: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => (
  <div className="flex items-center justify-between p-3 bg-surface-elevated border border-border/60 rounded-xl gap-4">
    <div>
      <span className="text-xs text-foreground block font-bold">{label}</span>
      {description && <span className="text-[10px] text-muted-foreground">{description}</span>}
    </div>
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Toggle button component                                             */
/* ------------------------------------------------------------------ */
const ToggleBtn: React.FC<{
  active: boolean;
  onToggle: () => void;
  activeLabel?: string;
  inactiveLabel?: string;
  activeVariant?: 'primary' | 'success';
}> = ({ active, onToggle, activeLabel = 'ACTIVE', inactiveLabel = 'OFF', activeVariant = 'primary' }) => (
  <button
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

/* ------------------------------------------------------------------ */
/* The accent color palette                                            */
/* ------------------------------------------------------------------ */
interface AccentOption {
  id: AccentTheme;
  label: string;
  darkColor: string;
  lightColor: string;
  description: string;
}

const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'midnight', label: 'Midnight', darkColor: '#3B82F6', lightColor: '#2563EB', description: 'Default deep blue' },
  { id: 'arctic',   label: 'Arctic',   darkColor: '#2563EB', lightColor: '#2563EB', description: 'Cool polar tones' },
  { id: 'indigo',   label: 'Royal Indigo', darkColor: '#6366F1', lightColor: '#6366F1', description: 'Electric purple-blue' },
  { id: 'emerald',  label: 'Emerald',  darkColor: '#10B981', lightColor: '#059669', description: 'Vibrant growth green' },
  { id: 'ember',    label: 'Ember',    darkColor: '#F97316', lightColor: '#EA580C', description: 'Warm energy orange' },
  { id: 'rose',     label: 'Rose',     darkColor: '#E11D48', lightColor: '#E11D48', description: 'Radiant crimson-pink' },
];

/* ------------------------------------------------------------------ */
/* Input / select shared style                                         */
/* ------------------------------------------------------------------ */
const selectCls = 'w-full bg-input border border-input-border rounded-xl px-3.5 py-2.5 text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all cursor-pointer';

/* ================================================================== */
/* Settings Page                                                       */
/* ================================================================== */
export const SettingsPage: React.FC = () => {
  useDocumentTitle('DailyForge — Settings');
  const { theme, setTheme, accentTheme, setAccentTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();
  const { success, info } = useToast();

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

  const handleSave = () => success('Settings saved', 'Your Daily Forge configurations have been stored.');

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left selection:bg-primary/20 select-none animate-fade-in pb-12">
      <PageHeader
        title="Settings"
        description="Control your Daily Forge experience."
      />

      {/* ── 1. PROFILE ────────────────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
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
      </Card>

      {/* ── 2. APPEARANCE (Theme + Accent) ────────────────────── */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
          <Palette className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Appearance</h3>
        </div>

        {/* 2a. Mode selector */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground block font-bold">Color Mode</label>
          <div className="grid grid-cols-3 gap-3 text-xs font-bold">
            {([
              { value: 'dark' as const,   label: 'Dark',   Icon: Moon },
              { value: 'light' as const,  label: 'Light',  Icon: Sun },
              { value: 'system' as const, label: 'System', Icon: Laptop },
            ]).map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer',
                  theme === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2b. Accent Color selector */}
        <div className="space-y-3">
          <label className="text-xs text-muted-foreground block font-bold">Accent Color</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ACCENT_OPTIONS.map((accent) => {
              const isSelected = accentTheme === accent.id;
              const color = resolvedTheme === 'dark' ? accent.darkColor : accent.lightColor;
              return (
                <button
                  key={accent.id}
                  onClick={() => setAccentTheme(accent.id)}
                  title={`${accent.label} — ${accent.description}`}
                  className={cn(
                    'group relative flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer text-center',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-border-strong hover:bg-muted'
                  )}
                >
                  {/* Swatch circle */}
                  <div
                    className="h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: isSelected ? color : 'transparent',
                    }}
                  >
                    {isSelected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                  </div>
                  {/* Label */}
                  <span className={cn(
                    'text-[10px] font-bold leading-tight',
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {accent.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Accent color applies to buttons, active states, and highlights. Works independently of Light/Dark mode.
          </p>
        </div>
      </Card>

      {/* ── 3. GENERAL PREFERENCES ────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
          <Eye className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Display &amp; General</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-muted-foreground block font-bold">Week Starts On</label>
            <select value={weekStarts} onChange={(e) => setWeekStarts(e.target.value as any)} className={selectCls}>
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-muted-foreground block font-bold">Date Format</label>
            <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value as any)} className={selectCls}>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-muted-foreground block font-bold">Default Time Block</label>
            <select value={defaultDuration} onChange={(e) => setDefaultDuration(e.target.value)} className={selectCls}>
              <option value="15m">15 Minutes</option>
              <option value="30m">30 Minutes</option>
              <option value="1h">1 Hour</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ── 4. HABIT PREFERENCES ──────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
          <Target className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Habit Configurations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-muted-foreground block font-bold">Default Habit Duration</label>
            <select value={defaultDuration} onChange={(e) => setDefaultDuration(e.target.value)} className={selectCls}>
              <option value="15m">15m</option>
              <option value="30m">30m</option>
              <option value="1h">1h</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-muted-foreground block font-bold">Default Reminder Offset</label>
            <select value={defaultReminder} onChange={(e) => setDefaultReminder(e.target.value)} className={selectCls}>
              <option value="at start">At Start</option>
              <option value="10m before">10m Before</option>
              <option value="30m before">30m Before</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-muted-foreground block font-bold">Difficulty Mode</label>
            <select value={difficultyPref} onChange={(e) => setDifficultyPref(e.target.value as any)} className={selectCls}>
              <option value="normal">Normal (default baseline)</option>
              <option value="strict">Strict (decreases skip buffers)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ── 5. AI & INTELLIGENCE ─────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
          <Sparkles className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Intelligence Settings</h3>
        </div>
        <div className="space-y-3">
          <SettingRow
            label="Personalization Engine"
            description="Authorize Daily Forge to map correlations between separate habits."
          >
            <ToggleBtn active={personalization} onToggle={() => setPersonalization(!personalization)} />
          </SettingRow>
          <SettingRow
            label="Forge Coach Assistant"
            description="Authorize chat coach dialogue and scheduling recommendations."
          >
            <ToggleBtn active={coachActive} onToggle={() => setCoachActive(!coachActive)} />
          </SettingRow>
          <SettingRow
            label="Insight Frequency"
            description="Control delivery intervals for behavioral cards."
          >
            <div className="flex gap-1 bg-surface-sunken p-1 border border-border rounded-lg shrink-0">
              {(['low', 'balanced', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
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
      </Card>

      {/* ── 6. PRIVACY & INTEGRATIONS ────────────────────────── */}
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
        <p className="text-[10px] text-muted-foreground pt-1">
          All integrations are fully opt-in and require explicit user authorization. Data is never shared with third parties.
        </p>
      </Card>

      {/* ── 7. NOTIFICATION CHANNELS ─────────────────────────── */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
          <Bell className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Notification Channels</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SettingRow label="Habit reminders">
            <ToggleBtn active={habitReminders} onToggle={() => setHabitReminders(!habitReminders)} activeLabel="ON" inactiveLabel="OFF" />
          </SettingRow>
          <SettingRow label="Goal notifications">
            <ToggleBtn active={goalReminders} onToggle={() => setGoalReminders(!goalReminders)} activeLabel="ON" inactiveLabel="OFF" />
          </SettingRow>
          <SettingRow label="Weekly scorecard reviews">
            <ToggleBtn active={weeklyReview} onToggle={() => setWeeklyReview(!weeklyReview)} activeLabel="ON" inactiveLabel="OFF" />
          </SettingRow>
          <SettingRow label="AI Coach insight pushes">
            <ToggleBtn active={insightNotifs} onToggle={() => setInsightNotifs(!insightNotifs)} activeLabel="ON" inactiveLabel="OFF" />
          </SettingRow>
        </div>
      </Card>

      {/* ── 8. DANGER ZONE ───────────────────────────────────── */}
      <Card className="p-6 space-y-4 border-danger/20">
        <div className="flex items-center gap-2 border-b border-danger/20 pb-2">
          <Database className="h-4.5 w-4.5 text-danger animate-pulse" />
          <h3 className="text-sm font-bold text-danger">Data Management &amp; Danger Zone</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold pt-1">
          <button
            onClick={() => info('Exporting data', 'Your habit logs are downloading in JSON format.')}
            className="bg-surface-elevated hover:bg-muted border border-border text-foreground px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            Export All Tracker Data (JSON)
          </button>
          <button
            onClick={() => info('Delete request logged', 'Verification email sent to confirm data removal.')}
            className="bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account &amp; Data</span>
          </button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="pt-2 text-right">
        <button
          onClick={handleSave}
          className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
};
