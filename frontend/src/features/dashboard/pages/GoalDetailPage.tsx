import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { GoalStatusBadge } from '@/features/goals/components/GoalStatusBadge';
import { GoalModal } from '@/features/goals/components/GoalModal';
import { goalService } from '@/services/goalService';
import { habitService } from '@/services/habitService';
import { taskService } from '@/services/taskService';
import { Goal, GoalMilestone } from '@/types/goal';
import { Habit } from '@/types/habit';
import { Task } from '@/types/task';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Check,
  Plus,
  Flame,
  Pause,
  Play,
  Archive,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const GoalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Link Habit / Task Modal states
  const [isLinkHabitOpen, setIsLinkHabitOpen] = useState(false);
  const [isLinkTaskOpen, setIsLinkTaskOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);

  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [taskTab, setTaskTab] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

  // New Milestone Form state
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneWeight, setNewMilestoneWeight] = useState(1);
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');

  useDocumentTitle(goal ? `DailyForge — ${goal.name}` : 'Goal Details');

  const fetchGoalDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await goalService.getGoal(id);
      setGoal(data);
    } catch {
      error('Goal not found', 'Could not load goal details.');
      navigate('/goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalDetails();
  }, [id]);

  // Load available habits and tasks for linking
  const handleOpenLinkHabits = async () => {
    try {
      const habits = await habitService.getHabits();
      setAllHabits(habits);
      setIsLinkHabitOpen(true);
    } catch {
      error('Failed to load habits', 'Please retry.');
    }
  };

  const handleOpenLinkTasks = async () => {
    try {
      const tasks = await taskService.getTasks();
      setAllTasks(tasks);
      setIsLinkTaskOpen(true);
    } catch {
      error('Failed to load tasks', 'Please retry.');
    }
  };

  // Milestone Completion Toggle
  const handleToggleMilestone = async (milestone: GoalMilestone) => {
    if (!goal || !milestone._id) return;
    const nextStatus = milestone.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await goalService.updateMilestone(goal.id, milestone._id, {
        status: nextStatus,
        progress: nextStatus === 'completed' ? 100 : 0,
      });
      setGoal(updated);
      success(
        nextStatus === 'completed' ? 'Milestone achieved! 🎯' : 'Milestone updated',
        `"${milestone.title}"`
      );
    } catch {
      error('Update failed', 'Could not update milestone.');
    }
  };

  // Add Milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !newMilestoneTitle.trim()) return;

    try {
      const updated = await goalService.addMilestone(goal.id, {
        title: newMilestoneTitle.trim(),
        weight: newMilestoneWeight || 1,
        dueDate: newMilestoneDueDate || undefined,
      });
      setGoal(updated);
      setNewMilestoneTitle('');
      setIsAddMilestoneOpen(false);
      success('Milestone created', 'Added to goal trajectory.');
    } catch {
      error('Failed to add milestone', 'Please retry.');
    }
  };

  // Habit link/unlink
  const handleLinkHabit = async (habitId: string) => {
    if (!goal) return;
    try {
      const updated = await goalService.linkHabit(goal.id, habitId);
      setGoal(updated);
      setIsLinkHabitOpen(false);
      success('Habit connected', 'Habit now contributes to this goal.');
    } catch {
      error('Link failed', 'Could not link habit.');
    }
  };

  const handleUnlinkHabit = async (habitId: string) => {
    if (!goal) return;
    try {
      const updated = await goalService.unlinkHabit(goal.id, habitId);
      setGoal(updated);
      info('Habit disconnected', 'Removed from this goal.');
    } catch {
      error('Unlink failed', 'Could not unlink habit.');
    }
  };

  // Task link/unlink & toggle
  const handleLinkTask = async (taskId: string) => {
    if (!goal) return;
    try {
      const updated = await goalService.linkTask(goal.id, taskId);
      setGoal(updated);
      setIsLinkTaskOpen(false);
      success('Task connected', 'Task now linked to this goal.');
    } catch {
      error('Link failed', 'Could not link task.');
    }
  };

  const handleUnlinkTask = async (taskId: string) => {
    if (!goal) return;
    try {
      const updated = await goalService.unlinkTask(goal.id, taskId);
      setGoal(updated);
      info('Task disconnected', 'Removed from this goal.');
    } catch {
      error('Unlink failed', 'Could not unlink task.');
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await taskService.updateTask(task.id, { status: nextStatus });
      fetchGoalDetails();
      success('Task updated', `"${task.title}" status changed.`);
    } catch {
      error('Update failed', 'Could not update task.');
    }
  };

  // Goal Quick Actions
  const handlePauseToggle = async () => {
    if (!goal) return;
    try {
      const updated = await goalService.togglePauseGoal(goal.id);
      setGoal(updated);
      success('Goal status updated', 'Pause state modified.');
    } catch {
      error('Update failed', 'Could not toggle pause state.');
    }
  };

  const handleArchive = async () => {
    if (!goal) return;
    try {
      await goalService.archiveGoal(goal.id);
      info('Goal archived', 'Goal moved to archives.');
      navigate('/goals');
    } catch {
      error('Archive failed', 'Could not archive goal.');
    }
  };

  const handleDelete = async () => {
    if (!goal || !window.confirm('Are you sure you want to permanently delete this goal?')) return;
    try {
      await goalService.deleteGoal(goal.id);
      success('Goal deleted', 'Goal and associations removed.');
      navigate('/goals');
    } catch {
      error('Deletion failed', 'Could not delete goal.');
    }
  };

  if (loading || !goal) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto text-left select-none pb-12 animate-pulse">
        <div className="h-10 bg-muted/20 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 bg-muted/20 rounded-2xl" />
          <div className="h-32 bg-muted/20 rounded-2xl" />
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

  const velocity = goal.velocity || 0;
  const remainingValue = Math.max(0, goal.targetValue - goal.currentValue);
  const targetDateStr = goal.targetDate || goal.deadline || 'No target deadline';
  const expectedDateStr = goal.expectedCompletionDate || targetDateStr;

  // Filter Tasks by tab
  const filteredTasks = (goal.tasks || []).filter((task: any) => {
    if (taskTab === 'completed') return task.status === 'completed';
    if (taskTab === 'today') return task.status !== 'completed';
    if (taskTab === 'upcoming') return task.status !== 'completed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left selection:bg-primary/20 select-none pb-12">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/goals')}
            className="p-2 rounded-xl bg-card hover:bg-surface-elevated border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Back to Goals"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold bg-muted/30 border border-border text-muted-foreground px-2 py-0.5 rounded-full uppercase">
                {goal.category}
              </span>
              <GoalStatusBadge status={goal.status} />
              {goal.priority && (
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {goal.priority}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
              {goal.name}
            </h1>
          </div>
        </div>

        {/* Quick Actions Buttons */}
        <div className="flex items-center gap-2 font-bold text-xs">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-elevated hover:bg-muted border border-border text-foreground rounded-xl transition-all cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={handlePauseToggle}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-elevated hover:bg-muted border border-border text-foreground rounded-xl transition-all cursor-pointer"
          >
            {goal.status === 'PAUSED' ? (
              <>
                <Play className="h-3.5 w-3.5 text-primary" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            )}
          </button>
          <button
            onClick={handleArchive}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-elevated hover:bg-muted border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all cursor-pointer"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Archive</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-surface-elevated hover:bg-danger/10 border border-border text-danger rounded-xl transition-all cursor-pointer"
            title="Delete Goal"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description Line if present */}
      {goal.description && (
        <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-3xl leading-relaxed">
          {goal.description}
        </p>
      )}

      {/* Progress Command Center Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Overall Progress Card */}
        <Card className="bg-card border border-border rounded-card p-5 flex items-center justify-between gap-3">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Overall Progress
            </span>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">
              {goal.progress}%
            </p>
            <p className="text-xs text-muted-foreground font-semibold">
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </p>
          </div>
          <div className="h-16 w-16 shrink-0">
            <ProgressRing
              value={goal.progress}
              size={64}
              strokeWidth={7}
              color={goal.progress === 100 ? '#10B981' : '#F97316'}
            />
          </div>
        </Card>

        {/* Velocity Card */}
        <Card className="bg-card border border-border rounded-card p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Goal Velocity
          </span>
          <div>
            <p
              className={cn(
                'text-3xl font-extrabold tracking-tight flex items-center gap-1.5',
                velocity > 0
                  ? 'text-success'
                  : velocity < 0
                  ? 'text-danger'
                  : 'text-foreground'
              )}
            >
              {velocity > 0 ? (
                <TrendingUp className="h-6 w-6" />
              ) : velocity < 0 ? (
                <TrendingDown className="h-6 w-6" />
              ) : null}
              <span>{velocity > 0 ? `+${velocity}%` : `${velocity}%`}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
              Weekly momentum rate
            </p>
          </div>
        </Card>

        {/* Expected Completion Card */}
        <Card className="bg-card border border-border rounded-card p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Expected Completion
          </span>
          <div>
            <p className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>{expectedDateStr}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
              Target: <strong className="text-foreground">{targetDateStr}</strong>
            </p>
          </div>
        </Card>

        {/* Remaining Margin Card */}
        <Card className="bg-card border border-border rounded-card p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Remaining Target
          </span>
          <div>
            <p className="text-3xl font-extrabold text-primary tracking-tight">
              {remainingValue} <span className="text-xs text-muted-foreground">{goal.unit}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
              {100 - goal.progress}% left to complete
            </p>
          </div>
        </Card>
      </div>

      {/* Trajectory Curve Visual Chart */}
      <Card className="bg-card border border-border rounded-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">Progress Trajectory Curve</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Actual execution vs expected trajectory line
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Actual Progress ({goal.progress}%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              <span>Expected Pacing</span>
            </span>
          </div>
        </div>

        {/* Visual Progress Trajectory Visualizer */}
        <div className="h-28 flex items-end justify-between gap-3 pt-6 px-2 border-b border-border/60">
          {(goal.trajectory || []).map((point, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full flex items-end justify-center gap-1 h-full">
                {/* Expected pacing bar */}
                <div
                  className="w-2.5 bg-slate-600/40 rounded-t transition-all"
                  style={{ height: `${point.expected}%` }}
                  title={`Expected: ${point.expected}%`}
                />
                {/* Actual progress bar */}
                <div
                  className="w-2.5 bg-primary rounded-t transition-all shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                  style={{ height: `${point.actual}%` }}
                  title={`Actual: ${point.actual}%`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono font-bold">
                {point.step}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Content Split: Milestones + Tasks vs Habits & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Milestones & Tasks (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Milestones Section */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">Target Milestones</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Segmented markers contributing to goal achievement
                </p>
              </div>
              <button
                onClick={() => setIsAddMilestoneOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-surface-elevated hover:bg-muted border border-border text-primary rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            {/* Milestones List */}
            {(!goal.milestones || goal.milestones.length === 0) ? (
              <p className="text-xs text-muted-foreground/60 py-6 text-center italic">
                No milestones added yet. Add milestones to track weighted progress.
              </p>
            ) : (
              <div className="space-y-2.5">
                {goal.milestones.map((m) => (
                  <div
                    key={m._id || m.id}
                    className={cn(
                      'p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3',
                      m.status === 'completed'
                        ? 'bg-primary/5 border-primary/25 opacity-75'
                        : 'bg-surface-elevated/70 border-border/70 hover:border-border'
                    )}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleMilestone(m)}
                        className={cn(
                          'h-5 w-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5',
                          m.status === 'completed'
                            ? 'bg-primary border-primary text-white'
                            : 'border-border hover:border-primary/50 text-transparent'
                        )}
                        title={m.status === 'completed' ? 'Mark incomplete' : 'Mark completed'}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3px]" />
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <h4
                          className={cn(
                            'text-xs font-bold text-foreground leading-snug',
                            m.status === 'completed' && 'line-through text-muted-foreground'
                          )}
                        >
                          {m.title}
                        </h4>
                        {m.dueDate && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Calendar className="h-3 w-3 text-primary" />
                            <span>Due: {m.dueDate}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-md border border-border text-muted-foreground shrink-0">
                      Weight: {m.weight}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Goal-Related Tasks Section */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">Goal Tasks</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Actionable execution items linked to this target
                </p>
              </div>
              <button
                onClick={handleOpenLinkTasks}
                className="flex items-center gap-1 px-3 py-1.5 bg-surface-elevated hover:bg-muted border border-border text-primary rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Link Task</span>
              </button>
            </div>

            {/* Task Tabs */}
            <div className="flex items-center gap-1 p-1 bg-surface-sunken rounded-xl border border-border/80 text-xs font-bold">
              {(['all', 'today', 'upcoming', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTaskTab(tab)}
                  className={cn(
                    'flex-1 py-1 px-2.5 rounded-lg capitalize transition-all cursor-pointer',
                    taskTab === tab
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 py-6 text-center italic">
                No tasks in this view. Click &quot;Link Task&quot; to connect existing tasks.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task: any) => (
                  <div
                    key={task._id || task.id}
                    className="p-3 bg-surface-elevated/70 border border-border/70 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        className={cn(
                          'h-4.5 w-4.5 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0',
                          task.status === 'completed'
                            ? 'bg-primary border-primary text-white'
                            : 'border-border hover:border-primary/50 text-transparent'
                        )}
                      >
                        <Check className="h-3 w-3 stroke-[3px]" />
                      </button>
                      <span
                        className={cn(
                          'text-foreground font-bold truncate',
                          task.status === 'completed' && 'line-through text-muted-foreground'
                        )}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.scheduledStart && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {task.scheduledStart}
                        </span>
                      )}
                      <button
                        onClick={() => handleUnlinkTask(task._id || task.id)}
                        className="text-muted-foreground hover:text-danger p-1 transition-colors cursor-pointer"
                        title="Unlink task"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Contributing Habits & Activity Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Contributing Habits Section */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">Contributing Habits</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Daily routines building goal momentum
                </p>
              </div>
              <button
                onClick={handleOpenLinkHabits}
                className="flex items-center gap-1 px-3 py-1.5 bg-surface-elevated hover:bg-muted border border-border text-primary rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Link Habit</span>
              </button>
            </div>

            {(!goal.habits || goal.habits.length === 0) ? (
              <p className="text-xs text-muted-foreground/60 py-6 text-center italic">
                No habits linked. Connect daily habits to feed automatic consistency.
              </p>
            ) : (
              <div className="space-y-2.5">
                {goal.habits.map((habit: any) => (
                  <div
                    key={habit._id || habit.id}
                    className="p-3 bg-surface-elevated/70 border border-border/70 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold"
                  >
                    <div className="min-w-0">
                      <span
                        onClick={() => navigate(`/habits/${habit._id || habit.id}`)}
                        className="text-foreground font-extrabold truncate block cursor-pointer hover:underline"
                      >
                        {habit.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {habit.category} • {habit.preferredTime || 'Daily'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-warning font-mono font-bold flex items-center gap-0.5">
                        <Flame className="h-3.5 w-3.5 fill-warning" />
                        <span>{habit.currentStreak || 0}d</span>
                      </span>
                      <button
                        onClick={() => handleUnlinkHabit(habit._id || habit.id)}
                        className="text-muted-foreground hover:text-danger p-1 transition-colors cursor-pointer"
                        title="Unlink habit"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Goal Activity Timeline Feed */}
          <Card className="bg-card border border-border rounded-card p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-foreground">Goal Activity History</h3>
            {(!goal.activities || goal.activities.length === 0) ? (
              <p className="text-xs text-muted-foreground/60 py-4 text-center italic">
                No logged activity yet.
              </p>
            ) : (
              <div className="space-y-3 relative border-l border-border/60 pl-3.5 ml-1">
                {goal.activities.slice(0, 8).map((act, idx) => (
                  <div key={idx} className="relative text-xs text-left">
                    <span className="absolute -left-[18px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                    <h5 className="text-foreground font-bold leading-tight">{act.title}</h5>
                    {act.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {act.description}
                      </p>
                    )}
                    <span className="text-[9px] text-muted-foreground font-mono block mt-0.5">
                      {new Date(act.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Goal Modal */}
      <GoalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        goal={goal}
        onSuccess={fetchGoalDetails}
      />

      {/* Add Milestone Modal */}
      {isAddMilestoneOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-elevated border border-border rounded-2xl p-5 max-w-sm w-full space-y-4 text-left shadow-2xl animate-scale-in">
            <h3 className="text-sm font-extrabold text-foreground">Add Target Milestone</h3>
            <form onSubmit={handleAddMilestone} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  Milestone Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master dynamic programming"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface-sunken border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">
                    Weight
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newMilestoneWeight}
                    onChange={(e) => setNewMilestoneWeight(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-surface-sunken border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    className="w-full h-9 px-2 rounded-xl bg-surface-sunken border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsAddMilestoneOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Habit Modal */}
      {isLinkHabitOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-elevated border border-border rounded-2xl p-5 max-w-md w-full space-y-4 text-left shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-foreground">Link an Existing Habit</h3>
              <button
                onClick={() => setIsLinkHabitOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {allHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="p-2.5 bg-surface-sunken border border-border/60 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold"
                >
                  <div className="min-w-0">
                    <p className="text-foreground font-bold truncate">{habit.name}</p>
                    <p className="text-[10px] text-muted-foreground">{habit.category}</p>
                  </div>
                  <button
                    onClick={() => handleLinkHabit(habit.id)}
                    className="px-3 py-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Link
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Link Task Modal */}
      {isLinkTaskOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-elevated border border-border rounded-2xl p-5 max-w-md w-full space-y-4 text-left shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-foreground">Link an Existing Task</h3>
              <button
                onClick={() => setIsLinkTaskOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {allTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 bg-surface-sunken border border-border/60 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold"
                >
                  <div className="min-w-0">
                    <p className="text-foreground font-bold truncate">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {task.priority} • {task.scheduledStart || 'No date'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLinkTask(task.id)}
                    className="px-3 py-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Link
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
