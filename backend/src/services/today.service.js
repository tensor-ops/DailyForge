const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const Task = require('../models/Task');
const FocusSession = require('../models/FocusSession');
const DailyReview = require('../models/DailyReview');
const DailySnapshot = require('../models/DailySnapshot');
const User = require('../models/User');
const { isDateScheduled, calculateHabitStats } = require('./habitAnalytics.service');
const { generateDailySparkNotification } = require('./dailySpark.service');
const behaviorAnalyticsService = require('./behaviorAnalytics.service');
const { formatDate } = require('../utils/dates');

/**
 * Parses time string (e.g. "07:30 PM", "19:30", "07:30") to minutes from midnight.
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 480; // default 08:00 AM (480 mins)
  const trimmed = timeStr.trim().toUpperCase();

  const isPM = trimmed.includes('PM');
  const isAM = trimmed.includes('AM');
  const clean = trimmed.replace('AM', '').replace('PM', '').trim();
  const parts = clean.split(':');

  let hours = parseInt(parts[0], 10) || 8;
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Formats minutes from midnight to readable string (e.g. "07:30 PM").
 */
function formatMinutesToTime(totalMins) {
  const hours24 = Math.floor(totalMins / 60) % 24;
  const mins = totalMins % 60;
  const isPM = hours24 >= 12;
  const hours12 = hours24 % 12 || 12;
  const paddedMins = mins < 10 ? `0${mins}` : mins;
  const period = isPM ? 'PM' : 'AM';
  return `${hours12 < 10 ? '0' + hours12 : hours12}:${paddedMins} ${period}`;
}

/**
 * Formats duration in minutes to readable string (e.g. "1h 30m" or "45m").
 */
function formatDuration(mins) {
  if (!mins || mins <= 0) return '30m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * Returns dynamic period greeting.
 */
function getGreetingPeriod(now = new Date()) {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

/**
 * Orchestrates all domain models into the unified Today overview.
 */
async function getTodayOverview(userId, dateParam = null) {
  const now = new Date();
  const todayStr = dateParam || formatDate(now);
  const dateObj = new Date(todayStr + 'T12:00:00');

  // Formatted date string (e.g. "Sunday, August 16")
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const [user, habits, tasks, focusSessions, dailyReview, completions, behaviorData] = await Promise.all([
    User.findById(userId).lean(),
    Habit.find({ userId, isArchived: false }).lean(),
    Task.find({
      userId,
      $or: [
        { scheduledStart: { $regex: '^' + todayStr } },
        { status: 'in_progress' },
        { status: 'todo', scheduledStart: null },
      ],
    }).lean(),
    FocusSession.find({
      userId,
      startedAt: {
        $gte: new Date(todayStr + 'T00:00:00.000Z'),
        $lte: new Date(todayStr + 'T23:59:59.999Z'),
      },
    }).lean(),
    DailyReview.findOne({ userId, date: todayStr }).lean(),
    HabitCompletion.find({ userId, date: todayStr }).lean(),
    behaviorAnalyticsService.getBehaviorAnalytics(userId, '30d').catch(() => null),
  ]);

  const completedHabitIds = new Set(completions.map((c) => c.habitId.toString()));
  const currentHourMins = now.getHours() * 60 + now.getMinutes();

  // 1. Process Scheduled Habits for Today
  const scheduledHabits = [];
  for (const habit of habits) {
    const isScheduled = isDateScheduled(habit, dateObj, todayStr);
    if (!isScheduled) continue;

    const isCompleted = completedHabitIds.has(habit._id.toString());
    const habitTimeStr = habit.preferredTime || '08:00 AM';
    const habitTimeMins = parseTimeToMinutes(habitTimeStr);
    const durationMinutes =
      habit.trackingType === 'duration' && habit.targetValue ? habit.targetValue : 30;

    let status = 'upcoming';
    if (isCompleted) {
      status = 'completed';
    } else if (currentHourMins >= habitTimeMins && currentHourMins <= habitTimeMins + durationMinutes) {
      status = 'in_progress';
    } else if (currentHourMins > habitTimeMins + durationMinutes) {
      status = 'overdue';
    }

    scheduledHabits.push({
      id: habit._id.toString(),
      name: habit.name,
      category: habit.category,
      time: formatMinutesToTime(habitTimeMins),
      rawMinutes: habitTimeMins,
      duration: formatDuration(durationMinutes),
      durationMinutes,
      streak: habit.currentStreak || 0,
      completed: isCompleted,
      status,
      trackingType: habit.trackingType || 'binary',
      difficulty: habit.difficulty || 'moderate',
      friction: habit.expectedFriction || 'medium',
      color: habit.color || '#3B82F6',
    });
  }

  // 2. Process Tasks for Today
  const processedTasks = tasks.map((task) => {
    const isCompleted = task.status === 'completed';
    const timeMins = task.scheduledStart && task.scheduledStart.includes(':')
      ? parseTimeToMinutes(task.scheduledStart.split(' ')[1] || task.scheduledStart)
      : 540; // Default 9:00 AM
    const durationMinutes = task.estimatedMinutes || 45;

    let status = task.status === 'in_progress' ? 'in_progress' : isCompleted ? 'completed' : 'upcoming';
    if (!isCompleted && status !== 'in_progress' && currentHourMins > timeMins + durationMinutes) {
      status = 'overdue';
    }

    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description || '',
      category: 'Work',
      priority: task.priority || 'medium',
      time: formatMinutesToTime(timeMins),
      rawMinutes: timeMins,
      duration: formatDuration(durationMinutes),
      durationMinutes,
      completed: isCompleted,
      status,
      actualMinutes: task.actualMinutes || 0,
    };
  });

  // 3. Progress Aggregation
  const habitsCompletedCount = scheduledHabits.filter((h) => h.completed).length;
  const habitsTotalCount = scheduledHabits.length;
  const tasksCompletedCount = processedTasks.filter((t) => t.completed).length;
  const tasksTotalCount = processedTasks.length;

  const totalItems = habitsTotalCount + tasksTotalCount;
  const completedItems = habitsCompletedCount + tasksCompletedCount;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const remainingCount = Math.max(0, totalItems - completedItems);

  // 4. Focus Time
  const loggedFocusMinutes = focusSessions.reduce((acc, f) => acc + (f.durationMinutes || 0), 0);
  const taskActualMinutes = processedTasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);
  const completedFocusMinutes = Math.max(
    loggedFocusMinutes + taskActualMinutes,
    scheduledHabits.filter((h) => h.completed).reduce((acc, h) => acc + h.durationMinutes, 0)
  );

  const plannedHabitsMinutes = scheduledHabits.reduce((acc, h) => acc + h.durationMinutes, 0);
  const plannedTasksMinutes = processedTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
  const totalPlannedMinutes = plannedHabitsMinutes + plannedTasksMinutes;

  // 5. Daily Capacity
  const availableMinutes = behaviorData?.focusCapacity?.capacityHours
    ? Math.round(behaviorData.focusCapacity.capacityHours * 60)
    : 260; // 4h 20m default baseline capacity

  const remainingCapacityMinutes = availableMinutes - totalPlannedMinutes;
  const isOverloaded = totalPlannedMinutes > availableMinutes;
  const overloadedByMinutes = Math.max(0, totalPlannedMinutes - availableMinutes);

  let capacityStatus = 'BALANCED';
  if (isOverloaded) {
    capacityStatus = 'OVER_CAPACITY';
  } else if (totalPlannedMinutes >= availableMinutes * 0.85) {
    capacityStatus = 'NEAR_LIMIT';
  }

  // 6. Chronological Today's Schedule Timeline
  const scheduleItems = [
    ...scheduledHabits.map((h) => ({
      id: h.id,
      type: 'habit',
      time: h.time,
      rawMinutes: h.rawMinutes,
      event: h.name,
      category: h.category,
      duration: h.duration,
      durationMinutes: h.durationMinutes,
      status: h.status,
      streak: h.streak,
    })),
    ...processedTasks.map((t) => ({
      id: t.id,
      type: 'task',
      time: t.time,
      rawMinutes: t.rawMinutes,
      event: t.title,
      category: t.category,
      duration: t.duration,
      durationMinutes: t.durationMinutes,
      status: t.status,
      priority: t.priority,
    })),
  ].sort((a, b) => a.rawMinutes - b.rawMinutes);

  // 7. Dynamic Next Best Action Scoring
  const incompleteHabits = scheduledHabits.filter((h) => !h.completed);
  const incompleteTasks = processedTasks.filter((t) => !t.completed);

  let nextBestAction = null;
  const candidates = [];

  for (const h of incompleteHabits) {
    let score = 50;
    // Highest active streak prioritizes habit preservation
    score += Math.min(30, (h.streak || 0) * 2);
    // Time urgency
    const diff = Math.abs(h.rawMinutes - currentHourMins);
    if (diff <= 60) score += 30;
    else if (diff <= 120) score += 15;
    if (h.status === 'in_progress') score += 50;
    if (h.status === 'overdue') score += 25;

    candidates.push({
      id: h.id,
      type: 'habit',
      title: h.name,
      category: h.category,
      reason: h.streak >= 3
        ? `Protect your ${h.streak}-day streak • High impact routine`
        : `Scheduled routine • Best window: ${h.time}`,
      scheduledTime: h.time,
      duration: h.duration,
      streak: h.streak,
      score,
    });
  }

  for (const t of incompleteTasks) {
    let score = 40;
    if (t.priority === 'critical') score += 50;
    else if (t.priority === 'high') score += 35;
    else if (t.priority === 'medium') score += 15;

    const diff = Math.abs(t.rawMinutes - currentHourMins);
    if (diff <= 60) score += 25;
    if (t.status === 'in_progress') score += 45;

    candidates.push({
      id: t.id,
      type: 'task',
      title: t.title,
      category: t.category,
      reason: `${t.priority.toUpperCase()} priority task • Estimated ${t.duration}`,
      scheduledTime: t.time,
      duration: t.duration,
      score,
    });
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    nextBestAction = candidates[0];
  }

  // 8. Daily Focus Priorities (Top 3)
  const priorityList = [];
  let rank = 1;

  // Include critical/high tasks first
  const highTasks = incompleteTasks.filter((t) => t.priority === 'critical' || t.priority === 'high');
  for (const t of highTasks) {
    if (rank > 3) break;
    priorityList.push({
      id: `priority-task-${t.id}`,
      rank: rank++,
      title: t.title,
      type: 'task',
      entityId: t.id,
      category: t.category,
      isCompleted: t.completed,
      isSuggested: false,
    });
  }

  // Include key active habits
  const topHabits = [...incompleteHabits].sort((a, b) => (b.streak || 0) - (a.streak || 0));
  for (const h of topHabits) {
    if (rank > 3) break;
    priorityList.push({
      id: `priority-habit-${h.id}`,
      rank: rank++,
      title: h.name,
      type: 'habit',
      entityId: h.id,
      category: h.category,
      isCompleted: h.completed,
      isSuggested: true,
    });
  }

  // Fill remaining slots if any
  for (const t of incompleteTasks.filter((t) => t.priority === 'medium' || t.priority === 'low')) {
    if (rank > 3) break;
    priorityList.push({
      id: `priority-task-${t.id}`,
      rank: rank++,
      title: t.title,
      type: 'task',
      entityId: t.id,
      category: t.category,
      isCompleted: t.completed,
      isSuggested: true,
    });
  }

  // 9. Daily Spark Context Quote
  const sparkNotif = generateDailySparkNotification(userId, habits, behaviorData, now);
  const quoteText = sparkNotif?.message?.replace(/"/g, '') || 'Focus on what matters most.';

  // 10. End of Day Review State
  const topCompleted = scheduledHabits.filter((h) => h.completed).sort((a, b) => b.streak - a.streak)[0];
  const atRiskIncomplete = scheduledHabits.filter((h) => !h.completed).sort((a, b) => b.streak - a.streak)[0];

  const userName = user?.name ? user.name.split(' ')[0] : 'Developer';

  return {
    date: todayStr,
    formattedDate,
    timezone: user?.timezone || 'Asia/Kolkata',

    greeting: {
      period: getGreetingPeriod(now),
      userName,
      title: `${getGreetingPeriod(now)}, ${userName}`,
      subtitle: `Today — ${formattedDate}`,
      sparkQuote: quoteText,
      sparkAttribution: 'Daily Forge',
    },

    progress: {
      completed: completedItems,
      total: totalItems,
      remaining: remainingCount,
      percentage: progressPercentage,
      habitsCompleted: habitsCompletedCount,
      habitsTotal: habitsTotalCount,
      tasksCompleted: tasksCompletedCount,
      tasksTotal: tasksTotalCount,
    },

    focusTime: {
      completedMinutes: completedFocusMinutes,
      plannedMinutes: totalPlannedMinutes,
      formattedCompleted: formatDuration(completedFocusMinutes),
      formattedPlanned: formatDuration(totalPlannedMinutes),
    },

    capacity: {
      availableMinutes,
      plannedMinutes: totalPlannedMinutes,
      remainingMinutes: remainingCapacityMinutes,
      isOverloaded,
      overloadedByMinutes,
      formattedAvailable: formatDuration(availableMinutes),
      formattedPlanned: formatDuration(totalPlannedMinutes),
      formattedRemaining: formatDuration(Math.abs(remainingCapacityMinutes)),
      status: capacityStatus,
    },

    nextBestAction,
    habits: scheduledHabits,
    tasks: processedTasks,
    schedule: scheduleItems,
    priorities: priorityList,

    endOfDay: {
      completedCount: completedItems,
      totalCount: totalItems,
      remainingCount,
      percentage: progressPercentage,
      isReviewCompleted: Boolean(dailyReview),
      review: dailyReview,
      strongestHabit: topCompleted ? topCompleted.name : 'All routines',
      needsAttention: atRiskIncomplete ? atRiskIncomplete.name : 'None',
    },
  };
}

/**
 * Submits End of Day Review.
 */
async function submitDailyReview(userId, { rating, notes = '', date = null }) {
  const dateStr = date || formatDate(new Date());

  const overview = await getTodayOverview(userId, dateStr);

  let forgeNote = `You completed ${overview.progress.percentage}% of today's commitments.`;
  if (overview.progress.percentage >= 80) {
    forgeNote += ' Exceptional discipline and high execution velocity.';
  } else if (overview.progress.percentage >= 50) {
    forgeNote += ' Steady consistency maintained. Build on this momentum tomorrow.';
  } else {
    forgeNote += ' Every repetition counts. Reset and forge ahead tomorrow.';
  }

  const review = await DailyReview.findOneAndUpdate(
    { userId, date: dateStr },
    {
      userId,
      date: dateStr,
      rating: rating || 'good',
      notes,
      completionPercentage: overview.progress.percentage,
      completedItems: overview.progress.completed,
      totalItems: overview.progress.total,
      focusMinutes: overview.focusTime.completedMinutes,
      forgeNote,
    },
    { upsert: true, new: true }
  );

  // BUG-7 FIX: Write a DailySnapshot for long-term trend analysis
  // Upsert so multiple submits on the same day don't duplicate records
  await DailySnapshot.findOneAndUpdate(
    { userId, date: dateStr },
    {
      userId,
      date: dateStr,
      plannedHabits: overview.progress.habitsTotal,
      completedHabits: overview.progress.habitsCompleted,
      missedHabits: Math.max(0, overview.progress.habitsTotal - overview.progress.habitsCompleted),
      plannedTasks: overview.progress.tasksTotal,
      completedTasks: overview.progress.tasksCompleted,
      completionRate: overview.progress.percentage,
      executionRate: overview.progress.percentage, // same baseline; can diverge with capacity data
      focusMinutes: overview.focusTime.completedMinutes,
      plannedMinutes: overview.focusTime.plannedMinutes,
      capacityMinutes: overview.capacity?.availableMinutes || 0,
    },
    { upsert: true, new: true }
  ).catch(() => null); // Non-critical — don't fail review submission if snapshot write fails

  return {
    review,
    forgeNote,
  };
}

/**
 * Reschedules a task or habit.
 */
async function rescheduleItem(userId, { id, type, newTime, newDate }) {
  if (type === 'task') {
    const task = await Task.findOne({ _id: id, userId });
    if (!task) throw new Error('Task not found');

    if (newDate) task.scheduledStart = newDate;
    if (newTime) {
      const datePart = (task.scheduledStart || formatDate(new Date())).split(' ')[0];
      task.scheduledStart = `${datePart} ${newTime}`;
    }
    await task.save();
    return task;
  } else if (type === 'habit') {
    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) throw new Error('Habit not found');

    if (newTime) habit.preferredTime = newTime;
    await habit.save();
    return habit;
  }

  throw new Error('Invalid reschedule type');
}

/**
 * Logs a focus session for today.
 */
async function logFocusSession(userId, { habitId, taskId, goalId, durationMinutes, focusQuality, distractionCount, startedAt, endedAt }) {
  const now = new Date();
  const start = startedAt ? new Date(startedAt) : new Date(now.getTime() - (durationMinutes || 25) * 60000);
  const end = endedAt ? new Date(endedAt) : now;
  const duration = durationMinutes || Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));

  const session = await FocusSession.create({
    userId,
    habitId: habitId || null,
    taskId: taskId || null,
    goalId: goalId || null,
    startedAt: start,
    endedAt: end,
    durationMinutes: duration,
    focusQuality: focusQuality || 5,
    distractionCount: distractionCount || 0,
  });

  return session.toJSON();
}

/**
 * Returns focus sessions for a given date (defaults to today).
 */
async function getFocusSessions(userId, dateParam = null) {
  const dateStr = dateParam || formatDate(new Date());
  const sessions = await FocusSession.find({
    userId,
    startedAt: {
      $gte: new Date(dateStr + 'T00:00:00.000Z'),
      $lte: new Date(dateStr + 'T23:59:59.999Z'),
    },
  }).sort({ startedAt: 1 }).lean();

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  return {
    date: dateStr,
    sessions: sessions.map((s) => ({
      id: s._id.toString(),
      habitId: s.habitId?.toString() || null,
      taskId: s.taskId?.toString() || null,
      goalId: s.goalId?.toString() || null,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      durationMinutes: s.durationMinutes,
      focusQuality: s.focusQuality,
      distractionCount: s.distractionCount,
    })),
    totalMinutes,
    formattedTotal: formatDuration(totalMinutes),
  };
}

module.exports = {
  getTodayOverview,
  submitDailyReview,
  rescheduleItem,
  logFocusSession,
  getFocusSessions,
  parseTimeToMinutes,
  formatMinutesToTime,
  formatDuration,
  getGreetingPeriod,
};
