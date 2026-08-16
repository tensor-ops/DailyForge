import React, { useEffect, useState, useMemo } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { EventModal } from '@/features/planner/components/EventModal';
import { EventDetailsModal } from '@/features/planner/components/EventDetailsModal';
import { FocusModeModal } from '@/features/planner/components/FocusModeModal';
import { AutoScheduleModal } from '@/features/planner/components/AutoScheduleModal';
import { plannerService } from '@/services/plannerService';
import {
  PlannerOverviewResponse,
  CalendarEvent,
} from '@/types/planner';
import {
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Target,
  AlertTriangle,
  Play,
  Check,
  Zap,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 07:00 to 23:00

export const PlannerDashboard: React.FC = () => {
  useDocumentTitle('DailyForge — Planner');
  const { success, error } = useToast();

  const [data, setData] = useState<PlannerOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);

  // Current time state
  const [nowMinutes, setNowMinutes] = useState(
    new Date().getHours() * 60 + new Date().getMinutes()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchPlannerData = async () => {
    try {
      setLoading(true);
      const res = await plannerService.getPlannerOverview({
        date: selectedDate,
        view: viewMode,
      });
      setData(res);
    } catch {
      error('Failed to load planner', 'Could not retrieve schedule data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();

    const handleUpdate = () => fetchPlannerData();
    window.addEventListener('planner-updated', handleUpdate);
    window.addEventListener('habits-updated', handleUpdate);
    return () => {
      window.removeEventListener('planner-updated', handleUpdate);
      window.removeEventListener('habits-updated', handleUpdate);
    };
  }, [selectedDate, viewMode]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key.toLowerCase() === 't') {
        setSelectedDate(new Date().toISOString().split('T')[0]);
      } else if (e.key.toLowerCase() === 'd') {
        setViewMode('day');
      } else if (e.key.toLowerCase() === 'w') {
        setViewMode('week');
      } else if (e.key.toLowerCase() === 'm') {
        setViewMode('month');
      } else if (e.key.toLowerCase() === 'c') {
        setSelectedEvent(null);
        setIsEventModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'day') d.setDate(d.getDate() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'day') d.setDate(d.getDate() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Date Range Label
  const rangeLabel = useMemo(() => {
    const d = new Date(selectedDate);
    if (viewMode === 'day') {
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (viewMode === 'week' && data) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedDate, viewMode, data]);

  // Week Days array for 7-column calendar
  const weekDays = useMemo(() => {
    if (!data?.startDate) return [];
    const days = [];
    const start = new Date(data.startDate);
    for (let i = 0; i < 7; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const dateStr = current.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: current.getDate(),
        isToday: dateStr === new Date().toISOString().split('T')[0],
      });
    }
    return days;
  }, [data?.startDate]);

  // Handle Apply Overload Recommendation
  const handleApplyRecommendation = async () => {
    if (!data?.capacity.recommendation) return;
    try {
      await plannerService.applyRecommendation({
        eventId: data.capacity.recommendation.eventId,
      });
      success('Schedule rebalanced! ✨', 'Postponed routine to preserve daily focus capacity.');
      fetchPlannerData();
    } catch {
      error('Failed to apply recommendation', 'Please retry.');
    }
  };

  // Schedule an item from Optimal Windows or Unscheduled Inbox
  const handleScheduleFromSuggestion = async (title: string, startTime: string, category: string) => {
    try {
      await plannerService.createEvent({
        title,
        date: selectedDate,
        startTime,
        endTime: '09:00 PM',
        durationMinutes: 90,
        category,
        type: 'FOCUS',
        priority: 'high',
      });
      success('Scheduled! ✦', `"${title}" added to your optimal window.`);
      fetchPlannerData();
    } catch {
      error('Failed to schedule', 'Please retry.');
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto text-left select-none pb-12 animate-pulse">
        <div className="h-14 bg-muted/20 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-96 bg-muted/20 rounded-2xl" />
          <div className="h-96 bg-muted/20 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { events, capacity, dayHealth, optimalWindows, currentBlock, unscheduledInbox, weekAtAGlance } = data!;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none pb-12">
      {/* Header */}
      <PageHeader
        title="Planner"
        description="Design your day around what matters."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAutoScheduleOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 bg-surface hover:bg-surface-elevated border border-border text-primary text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] cursor-pointer select-none"
            >
              <Sparkles className="h-4 w-4" />
              <span>Auto Schedule</span>
            </button>
            <button
              onClick={() => {
                setSelectedEvent(null);
                setIsEventModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer border border-transparent select-none"
            >
              <Plus className="h-4 w-4" />
              <span>+ Schedule</span>
            </button>
          </div>
        }
      />

      {/* Controller Toolbar: View switcher (Day/Week/Month) + Range Navigator */}
      <div className="p-2 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* View Switcher */}
        <div className="flex bg-surface-sunken p-1 border border-border/80 rounded-xl text-xs font-bold text-muted-foreground w-max shrink-0">
          {(['day', 'week', 'month'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={cn(
                'px-4 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer select-none',
                viewMode === v
                  ? 'bg-primary text-white shadow-sm font-extrabold'
                  : 'hover:text-foreground'
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Date Range Navigation */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-muted border border-border text-foreground font-bold text-[11px] cursor-pointer transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-surface-elevated hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-extrabold text-foreground px-2 text-xs uppercase tracking-wider">
              {rangeLabel}
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-surface-elevated hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Calendar Views (2 cols) vs Intelligence Panel (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Calendar Views (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* DAY VIEW: Vertical 24-Hour Timeline Matrix */}
          {viewMode === 'day' && (
            <Card className="bg-card border border-border rounded-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/10 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">Day Timeline</h3>
                  <p className="text-xs text-muted-foreground">{rangeLabel}</p>
                </div>
                <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                  {events.filter((e) => e.date === selectedDate).length} Scheduled Blocks
                </span>
              </div>

              {/* Hourly Time Grid */}
              <div className="relative border-l border-border/60 pl-6 ml-10 space-y-6 pt-2 pb-6 min-h-[500px]">
                {/* Current Time Line if selectedDate is today */}
                {selectedDate === new Date().toISOString().split('T')[0] && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center gap-2 pointer-events-none -ml-10"
                    style={{
                      top: `${Math.max(0, Math.min(100, ((nowMinutes - 420) / (1020)) * 100))}%`,
                    }}
                  >
                    <span className="text-[9px] font-mono font-extrabold bg-primary text-white px-1.5 py-0.5 rounded shadow">
                      NOW
                    </span>
                    <div className="flex-1 h-[2px] bg-primary shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  </div>
                )}

                {HOURS.map((hour) => {
                  const hourMinutes = hour * 60;
                  const hourLabel = `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
                  const matchingEvents = events.filter(
                    (e) => e.date === selectedDate && e.startMinutes >= hourMinutes && e.startMinutes < hourMinutes + 60
                  );

                  return (
                    <div key={hour} className="relative group text-xs text-left min-h-[44px]">
                      {/* Hour timestamp */}
                      <span className="absolute -left-16 -top-1 text-[10px] font-mono text-muted-foreground font-semibold">
                        {hourLabel}
                      </span>

                      {/* Event Cards inside this hour */}
                      <div className="space-y-2">
                        {matchingEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={() => {
                              setSelectedEvent(evt);
                              setIsDetailsModalOpen(true);
                            }}
                            className="p-3.5 rounded-2xl border bg-surface-elevated/80 border-border/80 hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-start justify-between gap-3 group/block relative"
                            style={{
                              borderLeft: `4px solid ${evt.color || '#F97316'}`,
                            }}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-extrabold bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase">
                                  {evt.type}
                                </span>
                                <span className="text-[10px] font-mono text-primary font-bold">
                                  {evt.startTime} — {evt.endTime} ({evt.durationMinutes}m)
                                </span>
                              </div>
                              <h4 className="text-sm font-extrabold text-foreground leading-tight truncate">
                                {evt.title}
                              </h4>
                              <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
                                <Target className="h-3 w-3 text-primary shrink-0" />
                                <span className="text-slate-300 font-bold">{evt.goalTitle}</span>
                                <span className="text-success text-[10px]">
                                  ({evt.expectedGoalContribution})
                                </span>
                              </p>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(evt);
                                setIsFocusModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow"
                            >
                              <Play className="h-3 w-3 fill-white" />
                              <span>Start</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* WEEK VIEW: 7-Column Time Grid */}
          {viewMode === 'week' && (
            <Card className="bg-card border border-border rounded-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/10 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">Week Calendar Grid</h3>
                  <p className="text-xs text-muted-foreground">{rangeLabel}</p>
                </div>
                <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                  7 Columns · {events.length} Scheduled
                </span>
              </div>

              {/* 7-Column Day Header */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs border-b border-border/60 pb-2">
                {weekDays.map((d) => (
                  <div
                    key={d.dateStr}
                    onClick={() => {
                      setSelectedDate(d.dateStr);
                      setViewMode('day');
                    }}
                    className={cn(
                      'p-2 rounded-xl border transition-all cursor-pointer select-none',
                      d.isToday
                        ? 'bg-primary/15 border-primary text-foreground font-extrabold shadow-sm'
                        : d.dateStr === selectedDate
                        ? 'bg-surface-elevated border-border text-foreground'
                        : 'bg-surface-sunken/40 border-border/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span className="text-[10px] uppercase font-bold block">{d.dayName}</span>
                    <span className="text-base font-extrabold block">{d.dayNum}</span>
                  </div>
                ))}
              </div>

              {/* Week Calendar Column Blocks */}
              <div className="grid grid-cols-7 gap-1.5 min-h-[380px]">
                {weekDays.map((d) => {
                  const dayEvts = events.filter((e) => e.date === d.dateStr);
                  return (
                    <div
                      key={d.dateStr}
                      className={cn(
                        'p-1.5 rounded-xl border space-y-1.5 min-h-[340px]',
                        d.isToday ? 'bg-primary/5 border-primary/20' : 'bg-surface-sunken/30 border-border/50'
                      )}
                    >
                      {dayEvts.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => {
                            setSelectedEvent(evt);
                            setIsDetailsModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-surface-elevated border border-border/70 hover:border-primary/50 text-left transition-all cursor-pointer shadow-sm group"
                          style={{ borderLeft: `3px solid ${evt.color || '#F97316'}` }}
                        >
                          <span className="text-[8px] font-mono text-primary font-bold block truncate">
                            {evt.startTime}
                          </span>
                          <h5 className="text-[11px] font-extrabold text-foreground truncate leading-tight mt-0.5">
                            {evt.title}
                          </h5>
                          <span className="text-[8px] text-muted-foreground block truncate">
                            {evt.durationMinutes}m • {evt.category}
                          </span>
                        </div>
                      ))}

                      {dayEvts.length === 0 && (
                        <div className="h-full flex items-center justify-center text-[10px] text-muted-foreground/40 italic">
                          Open
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom: Week at a Glance */}
              <div className="p-4 rounded-2xl bg-surface-sunken border border-border/80 space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                    Week At A Glance
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    Execution Score: 84%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Planned</span>
                    <strong className="text-foreground text-sm font-extrabold">{weekAtAGlance.plannedHours}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Completed</span>
                    <strong className="text-foreground text-sm font-extrabold">{weekAtAGlance.completedHours}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Focus Time</span>
                    <strong className="text-primary text-sm font-extrabold">{weekAtAGlance.focusHours}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Best Day</span>
                    <strong className="text-emerald-400 text-sm font-extrabold">{weekAtAGlance.bestDay.name} ({weekAtAGlance.bestDay.executionRate}%)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Goal Momentum</span>
                    <strong className="text-warning text-sm font-extrabold">+8% ML</strong>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* MONTH VIEW: 30-Day Calendar Matrix */}
          {viewMode === 'month' && (
            <Card className="bg-card border border-border rounded-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/10 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">Monthly Horizon Matrix</h3>
                  <p className="text-xs text-muted-foreground">{rangeLabel}</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> Healthy
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> Heavy
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="h-2 w-2 rounded-full bg-rose-400" /> Overloaded
                  </span>
                </div>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-[10px] font-bold text-muted-foreground uppercase py-1">
                    {day}
                  </div>
                ))}

                {Array.from({ length: 31 }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayDateStr = `2026-08-${dayNum < 10 ? `0${dayNum}` : dayNum}`;
                  const dayEvts = events.filter((e) => e.date === dayDateStr);
                  const isToday = dayDateStr === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={dayNum}
                      onClick={() => {
                        setSelectedDate(dayDateStr);
                        setViewMode('day');
                      }}
                      className={cn(
                        'h-20 p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer',
                        isToday
                          ? 'bg-primary/10 border-primary shadow-sm'
                          : dayEvts.length > 4
                          ? 'bg-danger/5 border-danger/30'
                          : 'bg-surface-elevated border-border/60 hover:border-border'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-foreground">{dayNum}</span>
                        {dayEvts.length > 0 && (
                          <span className="text-[9px] font-mono font-bold bg-muted px-1 rounded">
                            {dayEvts.length}
                          </span>
                        )}
                      </div>

                      {dayEvts.length > 0 ? (
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-bold text-primary truncate block">
                            {dayEvts[0].title}
                          </span>
                          <span className="text-[8px] text-muted-foreground block">
                            {dayEvts.length > 1 ? `+${dayEvts.length - 1} more` : '1 routine'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] text-muted-foreground/40 italic">Open</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Intelligence Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Active / Current Block (NOW) */}
          {currentBlock ? (
            <Card className="bg-primary/10 border border-primary/30 rounded-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Zap className="h-3 w-3 fill-white" />
                  <span>Active Now</span>
                </span>
                <span className="text-[10px] font-mono text-primary font-bold">
                  {currentBlock.startTime} — {currentBlock.endTime}
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-foreground leading-snug">
                  {currentBlock.title}
                </h4>
                <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                  <Target className="h-3 w-3 text-primary" />
                  <span>{currentBlock.goalTitle}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setSelectedEvent(currentBlock);
                    setIsFocusModalOpen(true);
                  }}
                  className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center justify-center gap-1 shadow cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Focus Mode</span>
                </button>
                <button
                  onClick={async () => {
                    await plannerService.completeEvent(currentBlock.id);
                    success('Session done!', `"${currentBlock.title}" logged.`);
                    fetchPlannerData();
                  }}
                  className="px-3 py-2 rounded-xl bg-surface-elevated hover:bg-emerald-500/20 border border-border text-foreground text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Done</span>
                </button>
              </div>
            </Card>
          ) : null}

          {/* 2. Day Health Score */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">Day Health</h3>
                <p className="text-xs text-muted-foreground">Execution balance rating</p>
              </div>
              <span
                className={cn(
                  'text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border',
                  dayHealth.status === 'HEALTHY'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                )}
              >
                {dayHealth.status}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-3xl font-extrabold text-foreground">{dayHealth.score}</span>
                <span className="text-xs text-muted-foreground font-bold"> / 100</span>
                <p className="text-[11px] text-muted-foreground font-medium">Optimal daily alignment</p>
              </div>
              <div className="h-16 w-16 shrink-0">
                <ProgressRing
                  value={dayHealth.score}
                  size={64}
                  strokeWidth={7}
                  color={dayHealth.score >= 80 ? '#10B981' : '#F97316'}
                />
              </div>
            </div>

            {/* Health Breakdown Metrics */}
            <div className="space-y-1.5 text-xs font-semibold pt-1 border-t border-border/60">
              <div className="flex justify-between text-slate-300">
                <span>Capacity Alignment</span>
                <span className="text-foreground font-bold">{dayHealth.breakdown.capacity}%</span>
              </div>
              <ProgressBar value={dayHealth.breakdown.capacity} />

              <div className="flex justify-between text-slate-300 pt-1">
                <span>Goal Alignment</span>
                <span className="text-primary font-bold">{dayHealth.breakdown.goalAlignment}%</span>
              </div>
              <ProgressBar value={dayHealth.breakdown.goalAlignment} />
            </div>
          </Card>

          {/* 3. Capacity Intelligence Panel */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-foreground">Capacity Intelligence</h3>
              <p className="text-xs text-muted-foreground">Workload validation & pacing</p>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between text-foreground">
                <span className="text-muted-foreground">Available Capacity:</span>
                <strong className="font-bold">{capacity.formattedAvailable}</strong>
              </div>
              <div className="flex justify-between text-foreground">
                <span className="text-muted-foreground">Planned Schedule:</span>
                <strong className={cn('font-bold', capacity.isOverloaded ? 'text-warning' : 'text-foreground')}>
                  {capacity.formattedPlanned}
                </strong>
              </div>
              <ProgressBar value={capacity.focusLoad} />
            </div>

            {/* Over capacity alert & Recommendation button */}
            {capacity.isOverloaded && capacity.recommendation && (
              <div className="p-3.5 rounded-2xl bg-warning/10 border border-warning/25 text-xs text-foreground space-y-2">
                <div className="flex items-center gap-1.5 text-warning font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{capacity.formattedRemaining} Over Capacity</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {capacity.recommendation.reason}
                </p>
                <button
                  onClick={handleApplyRecommendation}
                  className="w-full py-1.5 bg-warning/20 hover:bg-warning/30 border border-warning/30 text-warning rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Apply: {capacity.recommendation.action}
                </button>
              </div>
            )}
          </Card>

          {/* 4. Optimal Focus Windows */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-3.5">
            <div className="flex items-center gap-1.5 border-b border-border/10 pb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider">
                Optimal Windows
              </h3>
            </div>

            <div className="space-y-2.5 text-xs font-semibold">
              {optimalWindows.map((win, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-surface-elevated border border-border/70 rounded-xl flex items-center justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <span className="text-foreground font-extrabold truncate block">
                      {win.activity}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                      {win.startTime} — {win.endTime}
                    </span>
                  </div>
                  <button
                    onClick={() => handleScheduleFromSuggestion(win.activity, win.startTime, win.category)}
                    className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded-lg transition-all shrink-0 cursor-pointer shadow-sm"
                  >
                    Schedule
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* 5. Unscheduled Inbox */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/10 pb-2">
              <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                Unscheduled Inbox
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground">
                {unscheduledInbox.length} items
              </span>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              {unscheduledInbox.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-surface-elevated border border-border/70 rounded-xl flex items-center justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <span className="text-foreground font-bold truncate block">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground block">
                      {item.durationMinutes}m • {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleScheduleFromSuggestion(item.title, '02:00 PM', item.category)}
                    className="px-2.5 py-1 bg-surface-sunken hover:bg-primary hover:text-white border border-border text-foreground text-[10px] font-bold rounded-lg transition-all shrink-0 cursor-pointer"
                  >
                    + Place
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Schedule / Edit Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        initialDate={selectedDate}
        onSuccess={fetchPlannerData}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={(evt) => {
          setSelectedEvent(evt);
          setIsEventModalOpen(true);
        }}
        onStartFocus={(evt) => {
          setSelectedEvent(evt);
          setIsFocusModalOpen(true);
        }}
        onSuccess={fetchPlannerData}
      />

      {/* Focus Mode Timer Modal */}
      <FocusModeModal
        isOpen={isFocusModalOpen}
        onClose={() => {
          setIsFocusModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSuccess={fetchPlannerData}
      />

      {/* AI Auto Schedule Modal */}
      <AutoScheduleModal
        isOpen={isAutoScheduleOpen}
        onClose={() => setIsAutoScheduleOpen(false)}
        date={selectedDate}
        onSuccess={fetchPlannerData}
      />
    </div>
  );
};
