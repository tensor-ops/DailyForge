import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { todayService } from '@/services/todayService';
import { habitService } from '@/services/habitService';
import { TodayOverviewResponse, TodayHabitItem } from '@/types/today';

// Design System Components
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QuickAddModal } from '../components/QuickAddModal';
import { DailyReviewModal } from '../components/DailyReviewModal';

import {
  Clock,
  Check,
  Plus,
  Star,
  AlertTriangle,
  Sparkles,
  Play,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface TodayDashboardProps {
  onOpenCreateHabit?: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = () => {
  useDocumentTitle('DailyForge — Today');
  const navigate = useNavigate();
  const { success, info, error } = useToast();

  const [data, setData] = useState<TodayOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Reschedule state modal/popover
  const [rescheduleTarget, setRescheduleTarget] = useState<{
    id: string;
    type: 'habit' | 'task';
    title: string;
  } | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState('08:00 PM');

  const fetchTodayData = async () => {
    try {
      const overview = await todayService.getTodayOverview();
      setData(overview);
    } catch (err) {
      console.error('Failed to load today data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayData();

    const handleUpdate = () => fetchTodayData();
    window.addEventListener('habits-updated', handleUpdate);
    window.addEventListener('tasks-updated', handleUpdate);
    return () => {
      window.removeEventListener('habits-updated', handleUpdate);
      window.removeEventListener('tasks-updated', handleUpdate);
    };
  }, []);

  // Keyboard shortcut listener for Quick Add (Cmd+Shift+A or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle Habit Completion (Optimistic UI)
  const handleToggleHabit = async (habit: TodayHabitItem) => {
    const nextCompleted = !habit.completed;

    // Optimistic local update
    setData((prev) => {
      if (!prev) return prev;
      const updatedHabits = prev.habits.map((h) =>
        h.id === habit.id
          ? {
              ...h,
              completed: nextCompleted,
              status: (nextCompleted ? 'completed' : 'upcoming') as any,
              streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
            }
          : h
      );

      const habitsCompleted = updatedHabits.filter((h) => h.completed).length;
      const totalItems = updatedHabits.length + prev.tasks.length;
      const completedItems = habitsCompleted + prev.progress.tasksCompleted;
      const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        ...prev,
        habits: updatedHabits,
        progress: {
          ...prev.progress,
          completed: completedItems,
          percentage,
          remaining: Math.max(0, totalItems - completedItems),
          habitsCompleted,
        },
      };
    });

    try {
      if (nextCompleted) {
        await habitService.completeHabit(habit.id);
        success('Logged done! ✓', `"${habit.name}" completed today.`);
      } else {
        await habitService.uncompleteHabit(habit.id);
        info('Completion undone', `"${habit.name}" marked incomplete.`);
      }
      window.dispatchEvent(new Event('habits-updated'));
    } catch {
      error('Update failed', 'Could not update habit completion.');
      fetchTodayData(); // Rollback
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      await todayService.toggleTaskComplete(taskId, currentStatus);
      success('Task updated! ✓', 'Progress synchronized.');
      fetchTodayData();
      window.dispatchEvent(new Event('tasks-updated'));
    } catch {
      error('Update failed', 'Could not update task status.');
    }
  };

  // Submit Reschedule
  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget) return;
    try {
      await todayService.rescheduleItem(
        rescheduleTarget.id,
        rescheduleTarget.type,
        rescheduleTime
      );
      success('Rescheduled! ✦', `Moved "${rescheduleTarget.title}" to ${rescheduleTime}.`);
      setRescheduleTarget(null);
      fetchTodayData();
    } catch {
      error('Reschedule failed', 'Please retry.');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto text-left select-none pb-12 animate-pulse">
        <div className="h-16 bg-muted/20 rounded-2xl w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 bg-muted/20 rounded-2xl md:col-span-2" />
          <div className="h-32 bg-muted/20 rounded-2xl" />
          <div className="h-32 bg-muted/20 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-96 bg-muted/20 rounded-2xl" />
          <div className="h-96 bg-muted/20 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { greeting, progress, focusTime, capacity, nextBestAction, habits, schedule, priorities, endOfDay } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none pb-12">
      {/* Header with Dynamic Greeting & Daily Spark Quote */}
      <PageHeader
        title={greeting.title}
        description={`Today — ${data.formattedDate}`}
        actions={
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Quick Add</span>
          </button>
        }
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold italic mt-0.5">
          <span>&quot;{greeting.sparkQuote}&quot;</span>
          <span className="text-primary font-bold not-italic text-[10px]">
            — {greeting.sparkAttribution}
          </span>
        </div>
      </PageHeader>

      {/* Overload Alert Banner (if planned > available) */}
      {capacity.isOverloaded && (
        <div className="p-3.5 rounded-2xl bg-warning/10 border border-warning/30 flex items-center justify-between gap-3 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
            <span>
              <strong>Over capacity by {capacity.overloadedByMinutes}m.</strong> You have{' '}
              {capacity.formattedPlanned} planned for {capacity.formattedAvailable} available
              capacity.
            </span>
          </div>
          <button
            onClick={() => {
              if (habits.length > 0) {
                setRescheduleTarget({
                  id: habits[habits.length - 1].id,
                  type: 'habit',
                  title: habits[habits.length - 1].name,
                });
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-warning/20 hover:bg-warning/30 text-warning font-bold text-[11px] transition-colors shrink-0 cursor-pointer"
          >
            Reschedule Lower Priority
          </button>
        </div>
      )}

      {/* Top Cockpit Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Progress Ring Card */}
        <Card className="bg-card border border-border rounded-card p-5 flex items-center justify-between gap-4 sm:col-span-2">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Today&apos;s Progress
            </span>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">
              {progress.percentage}%
            </p>
            <p className="text-xs text-muted-foreground font-semibold">
              {progress.completed} / {progress.total} completed •{' '}
              <strong className="text-primary font-extrabold">
                {progress.remaining} remaining
              </strong>
            </p>
          </div>
          <div className="h-20 w-20 shrink-0">
            <ProgressRing
              value={progress.percentage}
              size={80}
              strokeWidth={8}
              color={progress.percentage === 100 ? '#10B981' : '#2563EB'}
            />
          </div>
        </Card>

        {/* Focus Hours Metric Card */}
        <Card className="bg-card border border-border rounded-card p-5 flex flex-col justify-between h-full">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Focus Time
          </span>
          <div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">
              {focusTime.formattedCompleted}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
              Planned: <strong className="text-foreground">{focusTime.formattedPlanned}</strong>
            </p>
          </div>
        </Card>

        {/* Daily Capacity Tracker Card */}
        <Card className="bg-card border border-border rounded-card p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Daily Capacity
            </span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Available: {capacity.formattedAvailable}</span>
              <span className="text-primary font-bold">Planned: {capacity.formattedPlanned}</span>
            </div>
            <ProgressBar
              value={Math.min(
                100,
                Math.round((capacity.plannedMinutes / (capacity.availableMinutes || 1)) * 100)
              )}
            />
            <p className="text-[10px] text-muted-foreground font-semibold flex items-center justify-between">
              <span>Status:</span>
              <strong
                className={cn(
                  'font-extrabold',
                  capacity.isOverloaded
                    ? 'text-danger'
                    : capacity.status === 'NEAR_LIMIT'
                    ? 'text-warning'
                    : 'text-success'
                )}
              >
                {capacity.isOverloaded
                  ? `${capacity.formattedRemaining} over capacity`
                  : `${capacity.formattedRemaining} remaining`}
              </strong>
            </p>
          </div>
        </Card>
      </div>

      {/* Main Split Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Next Action + Habits Checklist */}
        <div className="lg:col-span-2 space-y-5">
          {/* Next Best Action Card */}
          {nextBestAction ? (
            <Card className="bg-primary/5 border border-primary/20 rounded-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-primary" /> Next Best Action
                </span>
                <h3 className="text-lg font-extrabold text-foreground">{nextBestAction.title}</h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  {nextBestAction.reason} • Window:{' '}
                  <strong className="text-foreground">{nextBestAction.scheduledTime}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto font-bold text-xs">
                <button
                  onClick={() => {
                    success('Routine initiated! ⚡', `Timer set for ${nextBestAction.title}.`);
                    if (nextBestAction.type === 'habit') {
                      navigate(`/habits/${nextBestAction.id}`);
                    }
                  }}
                  className="flex-1 sm:flex-initial bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Start</span>
                </button>
                <button
                  onClick={() =>
                    setRescheduleTarget({
                      id: nextBestAction.id,
                      type: nextBestAction.type,
                      title: nextBestAction.title,
                    })
                  }
                  className="flex-1 sm:flex-initial bg-card hover:bg-surface-elevated border border-border text-foreground px-4 py-2 rounded-xl transition-all cursor-pointer text-center"
                >
                  Reschedule
                </button>
              </div>
            </Card>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>All scheduled routines and tasks are completed for today!</span>
            </div>
          )}

          {/* Today's Habits Checklist */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground text-left">
                Today&apos;s Habits checklist
              </h3>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {progress.habitsCompleted} of {progress.habitsTotal} done
              </span>
            </div>

            {habits.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="text-2xl">🌱</div>
                <h4 className="text-xs font-extrabold text-foreground">No habits scheduled today</h4>
                <p className="text-[11px] text-muted-foreground">
                  Create a routine or add a quick task to start shaping your day.
                </p>
                <button
                  onClick={() => setIsQuickAddOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold transition-all cursor-pointer"
                >
                  + Quick Add
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-semibold text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border/10 pb-2 text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 w-12 text-center">Done</th>
                      <th className="py-2.5 pl-2">Habit</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5">Scheduled</th>
                      <th className="py-2.5">Duration</th>
                      <th className="py-2.5 text-right pr-2">Streak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/5">
                    {habits.map((habit) => (
                      <tr
                        key={habit.id}
                        className={cn(
                          'hover:bg-muted/10 transition-colors group',
                          habit.completed && 'opacity-70'
                        )}
                      >
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleToggleHabit(habit)}
                            className={cn(
                              'h-5 w-5 rounded-md border flex items-center justify-center transition-all cursor-pointer mx-auto',
                              habit.completed
                                ? 'bg-primary border-primary text-white'
                                : 'border-border hover:border-primary/50 text-transparent'
                            )}
                            title={habit.completed ? 'Mark Incomplete' : 'Mark Complete'}
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3px]" />
                          </button>
                        </td>
                        <td className="py-3 pl-2 text-foreground font-extrabold flex items-center gap-2">
                          <span
                            onClick={() => navigate(`/habits/${habit.id}`)}
                            className="cursor-pointer hover:underline"
                          >
                            {habit.name}
                          </span>
                          {habit.status === 'in_progress' && (
                            <span className="text-[9px] bg-blue-500/15 text-blue-400 border border-blue-500/20 px-1 rounded font-bold uppercase">
                              Active
                            </span>
                          )}
                          {habit.status === 'overdue' && (
                            <span className="text-[9px] bg-warning/15 text-warning border border-warning/20 px-1 rounded font-bold uppercase">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded border border-white/5 text-slate-300">
                            {habit.category}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">{habit.time}</td>
                        <td className="py-3 text-muted-foreground">{habit.duration}</td>
                        <td
                          className="py-3 text-right pr-2 text-warning font-mono cursor-pointer hover:underline"
                          onClick={() => navigate(`/habits/${habit.id}`)}
                        >
                          🔥 {habit.streak}d
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Schedule, Priorities, End of Day */}
        <div className="space-y-5">
          {/* Today's Schedule Timeline */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground text-left">
                Today&apos;s Schedule
              </h3>
              <span className="text-[10px] text-muted-foreground font-bold">
                {schedule.length} events
              </span>
            </div>

            {schedule.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No events scheduled for today.
              </p>
            ) : (
              <div className="space-y-4 relative border-l border-border/60 pl-4 ml-1">
                {schedule.map((item, idx) => (
                  <div key={idx} className="relative group text-xs font-semibold text-left">
                    {/* Timeline dot */}
                    <span
                      className={cn(
                        'absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border transition-transform',
                        item.status === 'completed'
                          ? 'bg-emerald-400 border-emerald-400'
                          : item.status === 'in_progress'
                          ? 'bg-primary border-primary animate-ping'
                          : 'bg-surface-sunken border-primary group-hover:scale-125'
                      )}
                    />
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="text-[10px] text-primary font-bold block">{item.time}</span>
                        <h4
                          className={cn(
                            'text-foreground font-bold leading-none mt-0.5',
                            item.status === 'completed' && 'line-through text-muted-foreground'
                          )}
                        >
                          {item.event}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.category} • {item.duration}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setRescheduleTarget({
                            id: item.id,
                            type: item.type,
                            title: item.event,
                          })
                        }
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-primary hover:underline font-bold transition-opacity cursor-pointer shrink-0"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Daily Focus Priorities */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground text-left">
              Daily Focus Priorities
            </h3>
            <div className="space-y-2 text-xs font-semibold text-slate-300">
              {priorities.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  All priorities fulfilled!
                </p>
              ) : (
                priorities.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-surface-elevated border border-border/5 rounded-xl text-left flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="text-[9px] font-bold text-primary uppercase block mb-0.5">
                        Priority {p.rank} {p.isSuggested ? '• Suggested' : ''}
                      </span>
                      <span className={cn('text-foreground font-bold', p.isCompleted && 'line-through text-muted-foreground')}>
                        {p.title}
                      </span>
                    </div>
                    {p.type === 'task' && (
                      <button
                        onClick={() => handleToggleTask(p.entityId, p.isCompleted ? 'completed' : 'todo')}
                        className="text-muted-foreground hover:text-primary p-1 rounded cursor-pointer shrink-0"
                        title="Toggle task completion"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* End of Day Review Card */}
          <Card className="bg-card border border-primary/20 rounded-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">End of Day</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Conclude today&apos;s consistency review
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold border-b border-border/5 pb-3">
              <div>
                <span className="text-[10px] text-muted-foreground">Completions</span>
                <p className="text-foreground font-extrabold">{progress.completed} logged</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Remaining</span>
                <p className="text-primary font-bold">{progress.remaining} targets</p>
              </div>
            </div>
            <button
              onClick={() => setIsReviewOpen(true)}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md text-center cursor-pointer"
            >
              {endOfDay.isReviewCompleted ? 'Update Day Review' : 'Complete Day Review'}
            </button>
          </Card>
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={fetchTodayData}
      />

      {/* End of Day Review Modal */}
      {data && (
        <DailyReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          overview={data}
          onSuccess={fetchTodayData}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border p-5 max-w-sm w-full space-y-4 text-left shadow-2xl">
            <h3 className="text-sm font-extrabold text-foreground">
              Reschedule &quot;{rescheduleTarget.title}&quot;
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">New Preferred Time</label>
              <input
                type="text"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                placeholder="08:30 PM"
                className="w-full h-10 px-3 rounded-xl bg-surface-elevated border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Confirm Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
