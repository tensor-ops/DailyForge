const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const Task = require('../models/Task');
const { formatDate, parseDate } = require('../utils/dates');

/**
 * Recalculate goal progress, velocity, status, and projected completion date
 */
function calculateGoalMetrics(goal, habits = []) {
  let progress = goal.progress || 0;

  // 1. Calculate Progress based on Milestone weights if milestones exist
  if (goal.milestones && goal.milestones.length > 0) {
    const totalWeight = goal.milestones.reduce((sum, m) => sum + (m.weight || 1), 0);
    const completedWeight = goal.milestones.reduce(
      (sum, m) => sum + (m.status === 'completed' ? m.weight : (m.progress / 100) * (m.weight || 1)),
      0
    );
    progress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  } else if (goal.targetType === 'numeric' || goal.targetType === 'count') {
    if (goal.targetValue > 0) {
      progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
    }
  } else if (habits.length > 0) {
    const avgHabitRate = Math.round(
      habits.reduce((sum, h) => sum + (h.completionRate || 0), 0) / habits.length
    );
    progress = avgHabitRate;
  }

  progress = Math.max(0, Math.min(100, progress));

  // 2. Velocity Calculation (Progress change over past 7-14 days)
  let velocity = 0;
  if (goal.progressHistory && goal.progressHistory.length > 1) {
    const sorted = [...goal.progressHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const earliest = sorted[0];
    const latest = sorted[sorted.length - 1];
    velocity = latest.progress - earliest.progress;
  } else {
    velocity = progress > 50 ? 6 : progress > 20 ? 3 : 0;
  }

  // 3. Expected Trajectory & Status Calculation
  const todayStr = formatDate(new Date());
  const startDateStr = goal.startDate || goal.createdAt?.toISOString().split('T')[0] || todayStr;
  const targetDateStr = goal.targetDate || goal.deadline;

  let status = goal.status || 'ON_TRACK';

  if (goal.status === 'PAUSED') {
    status = 'PAUSED';
  } else if (progress >= 100) {
    status = 'COMPLETED';
  } else if (targetDateStr) {
    const startMs = new Date(startDateStr).getTime();
    const targetMs = new Date(targetDateStr).getTime();
    const nowMs = new Date(todayStr).getTime();

    if (nowMs > targetMs && progress < 100) {
      status = 'OVERDUE';
    } else {
      const totalSpan = Math.max(1, (targetMs - startMs) / (1000 * 60 * 60 * 24));
      const elapsedSpan = Math.max(0, (nowMs - startMs) / (1000 * 60 * 60 * 24));
      const expectedProgress = Math.min(100, Math.round((elapsedSpan / totalSpan) * 100));

      const delta = progress - expectedProgress;
      if (delta >= 5) {
        status = 'AHEAD';
      } else if (delta >= -5) {
        status = 'ON_TRACK';
      } else if (delta >= -15) {
        status = 'AT_RISK';
      } else {
        status = 'BEHIND';
      }
    }
  }

  // 4. Projected Completion Date Calculation
  let expectedCompletionDate = targetDateStr || null;
  if (progress < 100 && velocity > 0) {
    const remainingProgress = 100 - progress;
    const weeksRemaining = Math.ceil(remainingProgress / Math.max(1, velocity));
    const projected = new Date();
    projected.setDate(projected.getDate() + weeksRemaining * 7);
    expectedCompletionDate = formatDate(projected);
  }

  return {
    progress,
    velocity,
    status,
    expectedCompletionDate,
  };
}

/**
 * Get all goals for user with filters, search, and KPI overview
 */
async function getGoals(userId, query = {}) {
  const filter = { userId, isArchived: query.archived === 'true' };

  if (query.category && query.category !== 'All') {
    filter.category = query.category;
  }
  if (query.priority && query.priority !== 'All') {
    filter.priority = query.priority.toLowerCase();
  }
  if (query.status && query.status !== 'All') {
    filter.status = query.status.toUpperCase();
  }
  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
    ];
  }

  const rawGoals = await Goal.find(filter)
    .populate('habits', 'name category completionRate currentStreak preferredTime')
    .populate('tasks', 'title scheduledStart status priority estimatedMinutes')
    .sort({ createdAt: -1 })
    .lean();

  const enrichedGoals = rawGoals.map((goal) => {
    const metrics = calculateGoalMetrics(goal, goal.habits || []);
    return {
      ...goal,
      id: goal._id.toString(),
      progress: metrics.progress,
      velocity: metrics.velocity,
      status: metrics.status,
      expectedCompletionDate: metrics.expectedCompletionDate,
    };
  });

  // Calculate summary KPIs across active goals
  const activeList = enrichedGoals.filter((g) => !g.isArchived);
  const activeCount = activeList.length;
  const avgProgress =
    activeCount > 0
      ? Math.round(activeList.reduce((sum, g) => sum + (g.progress || 0), 0) / activeCount)
      : 0;
  const onTrackCount = activeList.filter(
    (g) => g.status === 'ON_TRACK' || g.status === 'AHEAD'
  ).length;
  const atRiskCount = activeList.filter(
    (g) => g.status === 'AT_RISK' || g.status === 'BEHIND' || g.status === 'OVERDUE'
  ).length;

  return {
    goals: enrichedGoals,
    summary: {
      activeGoals: activeCount,
      averageProgress: avgProgress,
      onTrackCount,
      atRiskCount,
    },
  };
}

/**
 * Get goal by ID with populated habits, tasks, and trajectory analytics
 */
async function getGoalById(userId, goalId) {
  const goal = await Goal.findOne({ _id: goalId, userId })
    .populate('habits', 'name category completionRate currentStreak preferredTime')
    .populate('tasks', 'title scheduledStart status priority estimatedMinutes')
    .lean();

  if (!goal) return null;

  const metrics = calculateGoalMetrics(goal, goal.habits || []);

  // Generate Trajectory Chart Data (actual vs expected vs target line)
  const trajectory = generateTrajectoryChart(goal, metrics.progress);

  return {
    ...goal,
    id: goal._id.toString(),
    progress: metrics.progress,
    velocity: metrics.velocity,
    status: metrics.status,
    expectedCompletionDate: metrics.expectedCompletionDate,
    trajectory,
  };
}

/**
 * Create a new goal
 */
async function createGoal(userId, data) {
  const todayStr = formatDate(new Date());

  const goal = new Goal({
    userId,
    name: data.name.trim(),
    description: data.description || '',
    category: data.category || 'Career',
    priority: data.priority || 'medium',
    targetType: data.targetType || 'percentage',
    currentValue: data.currentValue || 0,
    targetValue: data.targetValue || 100,
    unit: data.unit || '%',
    startDate: data.startDate || todayStr,
    targetDate: data.targetDate || data.deadline || null,
    deadline: data.targetDate || data.deadline || null,
    habits: data.habits || [],
    tasks: data.tasks || [],
    milestones: (data.milestones || []).map((m) => ({
      title: m.title || m.label,
      description: m.description || '',
      weight: m.weight || 1,
      dueDate: m.dueDate || null,
      status: m.status || 'pending',
      progress: m.progress || 0,
    })),
    progressHistory: [{ date: todayStr, progress: data.currentValue || 0, source: 'manual' }],
    activities: [
      {
        activityType: 'CREATED',
        title: 'Goal initialized',
        description: `Created goal "${data.name.trim()}"`,
      },
    ],
  });

  const saved = await goal.save();
  return getGoalById(userId, saved._id);
}

/**
 * Update a goal
 */
async function updateGoal(userId, goalId, data) {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) return null;

  if (data.name) goal.name = data.name.trim();
  if (data.description !== undefined) goal.description = data.description;
  if (data.category) goal.category = data.category;
  if (data.priority) goal.priority = data.priority;
  if (data.targetType) goal.targetType = data.targetType;
  if (data.currentValue !== undefined) goal.currentValue = data.currentValue;
  if (data.targetValue !== undefined) goal.targetValue = data.targetValue;
  if (data.unit) goal.unit = data.unit;
  if (data.targetDate !== undefined) {
    goal.targetDate = data.targetDate;
    goal.deadline = data.targetDate;
  }
  if (data.status) goal.status = data.status;
  if (data.habits) goal.habits = data.habits;
  if (data.tasks) goal.tasks = data.tasks;
  if (data.milestones) goal.milestones = data.milestones;

  // Add progress history record if progress changed
  const todayStr = formatDate(new Date());
  const metrics = calculateGoalMetrics(goal);
  goal.progress = metrics.progress;
  goal.velocity = metrics.velocity;
  goal.status = metrics.status;
  goal.expectedCompletionDate = metrics.expectedCompletionDate;

  goal.progressHistory.push({
    date: todayStr,
    progress: metrics.progress,
    source: 'manual',
  });

  goal.activities.unshift({
    activityType: 'PROGRESS_UPDATED',
    title: 'Goal updated',
    description: `Progress is currently at ${metrics.progress}%`,
  });

  await goal.save();
  return getGoalById(userId, goalId);
}

/**
 * Delete a goal
 */
async function deleteGoal(userId, goalId) {
  return Goal.findOneAndDelete({ _id: goalId, userId });
}

/**
 * Archive a goal
 */
async function archiveGoal(userId, goalId) {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) return null;

  goal.isArchived = true;
  goal.archivedAt = new Date();
  goal.activities.unshift({
    activityType: 'ARCHIVED',
    title: 'Goal archived',
    description: 'Goal moved to archives',
  });

  await goal.save();
  return getGoalById(userId, goalId);
}

/**
 * Toggle Pause / Resume goal
 */
async function togglePauseGoal(userId, goalId) {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) return null;

  if (goal.status === 'PAUSED') {
    goal.status = 'ON_TRACK';
    goal.pausedAt = null;
    goal.activities.unshift({
      activityType: 'RESUMED',
      title: 'Goal resumed',
      description: 'Goal active pacing resumed',
    });
  } else {
    goal.status = 'PAUSED';
    goal.pausedAt = new Date();
    goal.activities.unshift({
      activityType: 'PAUSED',
      title: 'Goal paused',
      description: 'Goal progression paused',
    });
  }

  await goal.save();
  return getGoalById(userId, goalId);
}

/**
 * Duplicate a goal
 */
async function duplicateGoal(userId, goalId) {
  const original = await Goal.findOne({ _id: goalId, userId }).lean();
  if (!original) return null;

  const todayStr = formatDate(new Date());
  const duplicate = new Goal({
    ...original,
    _id: undefined,
    name: `${original.name} (Copy)`,
    progress: 0,
    currentValue: 0,
    status: 'ON_TRACK',
    progressHistory: [{ date: todayStr, progress: 0, source: 'manual' }],
    activities: [
      {
        activityType: 'CREATED',
        title: 'Goal duplicated',
        description: `Duplicated from "${original.name}"`,
      },
    ],
  });

  const saved = await duplicate.save();
  return getGoalById(userId, saved._id);
}

/**
 * Milestone Operations
 */
async function addMilestone(userId, goalId, milestoneData) {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) return null;

  goal.milestones.push({
    title: milestoneData.title,
    description: milestoneData.description || '',
    weight: milestoneData.weight || 1,
    dueDate: milestoneData.dueDate || null,
    status: 'pending',
    progress: 0,
  });

  goal.activities.unshift({
    activityType: 'MILESTONE_ADDED',
    title: 'Milestone added',
    description: `Added milestone "${milestoneData.title}"`,
  });

  await goal.save();
  return getGoalById(userId, goalId);
}

async function updateMilestone(userId, goalId, milestoneId, data) {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) return null;

  const milestone = goal.milestones.id(milestoneId);
  if (!milestone) return null;

  if (data.title) milestone.title = data.title;
  if (data.description !== undefined) milestone.description = data.description;
  if (data.status) {
    milestone.status = data.status;
    if (data.status === 'completed') {
      milestone.progress = 100;
      milestone.completedAt = new Date();
      goal.activities.unshift({
        activityType: 'MILESTONE_COMPLETED',
        title: 'Milestone reached! 🎯',
        description: `Completed milestone "${milestone.title}"`,
      });
    }
  }
  if (data.progress !== undefined) milestone.progress = data.progress;
  if (data.weight !== undefined) milestone.weight = data.weight;
  if (data.dueDate !== undefined) milestone.dueDate = data.dueDate;

  const metrics = calculateGoalMetrics(goal);
  goal.progress = metrics.progress;
  goal.status = metrics.status;

  await goal.save();
  return getGoalById(userId, goalId);
}

async function deleteMilestone(userId, goalId, milestoneId) {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) return null;

  goal.milestones = goal.milestones.filter((m) => m._id.toString() !== milestoneId);
  await goal.save();
  return getGoalById(userId, goalId);
}

/**
 * Link / Unlink Habits
 */
async function linkHabit(userId, goalId, habitId) {
  const [goal, habit] = await Promise.all([
    Goal.findOne({ _id: goalId, userId }),
    Habit.findOne({ _id: habitId, userId }),
  ]);

  if (!goal || !habit) return null;

  if (!goal.habits.some((id) => id.toString() === habitId)) {
    goal.habits.push(habitId);
    goal.activities.unshift({
      activityType: 'HABIT_LINKED',
      title: 'Habit connected',
      description: `Linked habit "${habit.name}" to this goal`,
    });
    await goal.save();
  }

  return getGoalById(userId, goalId);
}

async function unlinkHabit(userId, goalId, habitId) {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) return null;

  goal.habits = goal.habits.filter((id) => id.toString() !== habitId);
  goal.activities.unshift({
    activityType: 'HABIT_UNLINKED',
    title: 'Habit disconnected',
    description: 'Unlinked habit from this goal',
  });

  await goal.save();
  return getGoalById(userId, goalId);
}

/**
 * Link / Unlink Tasks
 */
async function linkTask(userId, goalId, taskId) {
  const [goal, task] = await Promise.all([
    Goal.findOne({ _id: goalId, userId }),
    Task.findOne({ _id: taskId, userId }),
  ]);

  if (!goal || !task) return null;

  if (!goal.tasks.some((id) => id.toString() === taskId)) {
    goal.tasks.push(taskId);
    goal.activities.unshift({
      activityType: 'TASK_LINKED',
      title: 'Task connected',
      description: `Linked task "${task.title}" to this goal`,
    });
    await goal.save();
  }

  return getGoalById(userId, goalId);
}

async function unlinkTask(userId, goalId, taskId) {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) return null;

  goal.tasks = goal.tasks.filter((id) => id.toString() !== taskId);
  await goal.save();
  return getGoalById(userId, goalId);
}

/**
 * Helper to generate 4-point historical trajectory chart data
 */
function generateTrajectoryChart(goal, currentProgress) {
  const points = [];
  const totalPoints = 6;
  const startProgress = Math.max(0, currentProgress - 30);

  for (let i = 0; i < totalPoints; i++) {
    const fraction = i / (totalPoints - 1);
    const actual = Math.min(100, Math.round(startProgress + (currentProgress - startProgress) * fraction));
    const expected = Math.min(100, Math.round(fraction * 100));

    points.push({
      step: `W${i + 1}`,
      actual,
      expected,
      target: 100,
    });
  }

  return points;
}

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  archiveGoal,
  togglePauseGoal,
  duplicateGoal,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  linkHabit,
  unlinkHabit,
  linkTask,
  unlinkTask,
  calculateGoalMetrics,
};
