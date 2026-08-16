const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const HabitMiss = require('../models/HabitMiss');
const { calculateHabitStats } = require('./streak.service');
const { getHabitDetailedAnalytics } = require('./habitAnalytics.service');
const { NotFoundError, AuthorizationError, ConflictError } = require('../utils/errors');
const { formatDate } = require('../utils/dates');

async function createHabit(userId, habitData) {
  const startDate = habitData.startDate || formatDate(new Date());

  const habit = new Habit({
    ...habitData,
    userId,
    startDate,
  });

  await habit.save();
  return formatHabitResponse(habit.toObject(), {
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    completionRate: 0,
    completedToday: false,
    history: {},
  });
}

async function getHabitsOverview(userId, options = {}) {
  const habits = await Habit.find({ userId, isArchived: false })
    .sort({ createdAt: -1 })
    .lean();

  const now = new Date();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const enrichedHabits = await Promise.all(
    habits.map(async (h) => {
      const analytics = await getHabitDetailedAnalytics(h._id, userId);
      const isNew = (now.getTime() - new Date(h.createdAt).getTime()) <= SEVEN_DAYS_MS;
      const isStrong = analytics.reliability >= 80 && analytics.stabilityRisk === 'STABLE';
      const isAtRisk = analytics.stabilityRisk === 'AT_RISK' || analytics.stabilityRisk === 'HIGH_RISK';

      return {
        id: h._id.toString(),
        userId: h.userId.toString(),
        name: h.name,
        description: h.description || '',
        category: h.category,
        icon: h.icon || 'target',
        trackingType: h.trackingType || 'binary',
        frequency: h.frequency,
        customDays: h.customDays || [],
        targetValue: h.targetValue || 1,
        unit: h.unit || 'times',
        preferredTime: h.preferredTime || '',
        timeWindowStart: h.timeWindowStart || '',
        timeWindowEnd: h.timeWindowEnd || '',
        reminderEnabled: Boolean(h.reminderEnabled),
        reminderTime: h.reminderTime || '',
        reminderDays: h.reminderDays || [],
        difficulty: h.difficulty || 'moderate',
        expectedFriction: h.expectedFriction || 'medium',
        checklistItems: h.checklistItems || [],
        startDate: h.startDate,
        color: h.color || '#6366f1',
        isArchived: h.isArchived || false,
        createdAt: h.createdAt ? new Date(h.createdAt).toISOString() : now.toISOString(),
        updatedAt: h.updatedAt ? new Date(h.updatedAt).toISOString() : now.toISOString(),

        // Unified analytics metrics
        reliability: analytics.reliability,
        consistency: analytics.consistency,
        currentStreak: analytics.currentStreak,
        longestStreak: analytics.longestStreak,
        completedToday: analytics.dailyTrend[analytics.dailyTrend.length - 1]?.completed || false,
        completionRate: analytics.completionRate,
        friction: analytics.friction,
        stabilityRisk: analytics.stabilityRisk,
        stabilityTrend: analytics.stabilityTrend,
        bestTime: analytics.bestTime,
        progress: analytics.progress,
        isNew,
        isStrong,
        isAtRisk,
      };
    })
  );

  const totalActive = enrichedHabits.length;
  const avgReliability =
    totalActive > 0
      ? Math.round(enrichedHabits.reduce((acc, h) => acc + h.reliability, 0) / totalActive)
      : 80;

  const avgCompletion =
    totalActive > 0
      ? Math.round(enrichedHabits.reduce((acc, h) => acc + h.completionRate, 0) / totalActive)
      : 80;

  const atRiskCount = enrichedHabits.filter((h) => h.isAtRisk).length;
  const strongCount = enrichedHabits.filter((h) => h.isStrong).length;
  const stableCount = enrichedHabits.filter((h) => !h.isAtRisk && !h.isStrong).length;
  const bestCurrentStreak = enrichedHabits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0);

  // Derive pulse insight
  let pulse = null;
  if (totalActive > 0) {
    const topHabit = [...enrichedHabits].sort((a, b) => b.reliability - a.reliability)[0];
    const atRiskHabit = enrichedHabits.find((h) => h.isAtRisk);
    if (atRiskHabit) {
      pulse = `Your strongest habit is ${topHabit.name} (${topHabit.reliability}%). ${atRiskHabit.name} is currently your primary at-risk routine.`;
    } else {
      pulse = `Your strongest habit is ${topHabit.name} with ${topHabit.reliability}% reliability. All ${totalActive} active routines are in a stable flow.`;
    }
  }

  const summary = {
    activeHabits: totalActive,
    averageReliability: avgReliability,
    averageCompletion: avgCompletion,
    atRisk: atRiskCount,
    strong: strongCount,
    bestCurrentStreak,
    healthDistribution: {
      strong: strongCount,
      stable: stableCount,
      atRisk: atRiskCount,
      total: totalActive,
    },
    pulse,
  };

  return {
    summary,
    habits: enrichedHabits,
  };
}

async function getHabits(userId, options = {}) {
  const {
    status = 'active',
    category,
    searchQuery,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  } = options;

  const query = { userId };

  if (status === 'active') {
    query.isArchived = false;
  } else if (status === 'archived') {
    query.isArchived = true;
  }

  if (category && category !== 'all') {
    query.category = category;
  }

  if (searchQuery) {
    query.name = { $regex: searchQuery, $options: 'i' };
  }

  const sortOption = {};
  sortOption[sortBy === 'createdDate' ? 'createdAt' : sortBy] = sortOrder === 'asc' ? 1 : -1;

  const total = await Habit.countDocuments(query);
  const habits = await Habit.find(query)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const formattedHabits = await Promise.all(
    habits.map(async (h) => {
      const stats = await calculateHabitStats(h._id, userId, h.startDate);
      return formatHabitResponse(h, stats);
    })
  );

  return {
    habits: formattedHabits,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function getHabitById(habitId, userId) {
  const habit = await Habit.findById(habitId).lean();
  if (!habit) {
    throw new NotFoundError('Habit not found');
  }
  if (habit.userId.toString() !== userId.toString()) {
    throw new AuthorizationError('You do not have access to this habit');
  }

  const stats = await calculateHabitStats(habit._id, userId, habit.startDate);
  return formatHabitResponse(habit, stats);
}

async function getHabitAnalytics(habitId, userId) {
  return await getHabitDetailedAnalytics(habitId, userId);
}

async function logHabitMiss(habitId, userId, { reason, notes = '', date = null }) {
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new NotFoundError('Habit not found');
  }
  if (habit.userId.toString() !== userId.toString()) {
    throw new AuthorizationError('You do not have access to this habit');
  }

  const dateStr = date || formatDate(new Date());

  const miss = await HabitMiss.findOneAndUpdate(
    { habitId, date: dateStr },
    {
      habitId,
      userId,
      date: dateStr,
      reason,
      notes,
    },
    { upsert: true, new: true }
  );

  return miss;
}

async function updateHabit(habitId, userId, updateData) {
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new NotFoundError('Habit not found');
  }
  if (habit.userId.toString() !== userId.toString()) {
    throw new AuthorizationError('You do not have access to this habit');
  }

  Object.assign(habit, updateData);
  await habit.save();

  const stats = await calculateHabitStats(habit._id, userId, habit.startDate);
  return formatHabitResponse(habit.toObject(), stats);
}

async function deleteHabit(habitId, userId) {
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new NotFoundError('Habit not found');
  }
  if (habit.userId.toString() !== userId.toString()) {
    throw new AuthorizationError('You do not have access to this habit');
  }

  await Habit.deleteOne({ _id: habitId });
  await HabitCompletion.deleteMany({ habitId });
  await HabitMiss.deleteMany({ habitId });

  return { id: habitId };
}

async function completeHabit(habitId, userId, dateInput, notes = '') {
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new NotFoundError('Habit not found');
  }
  if (habit.userId.toString() !== userId.toString()) {
    throw new AuthorizationError('You do not have access to this habit');
  }

  const dateStr = dateInput || formatDate(new Date());

  const existingCompletion = await HabitCompletion.findOne({ habitId, date: dateStr });
  if (existingCompletion) {
    throw new ConflictError(`Habit already completed for ${dateStr}`);
  }

  await HabitCompletion.create({
    habitId,
    userId,
    date: dateStr,
    completedAt: new Date(),
    notes,
  });

  // Recalculate stats and update Habit model cache fields
  const stats = await calculateHabitStats(habitId, userId, habit.startDate);
  habit.currentStreak = stats.currentStreak;
  habit.longestStreak = stats.longestStreak;
  habit.totalCompletions = stats.totalCompletions;
  habit.completionRate = stats.completionRate;
  habit.lastCompletedAt = dateStr;
  await habit.save();

  return formatHabitResponse(habit.toObject(), stats);
}

async function uncompleteHabit(habitId, userId, dateInput) {
  const habit = await Habit.findById(habitId);
  if (!habit) {
    throw new NotFoundError('Habit not found');
  }
  if (habit.userId.toString() !== userId.toString()) {
    throw new AuthorizationError('You do not have access to this habit');
  }

  const dateStr = dateInput || formatDate(new Date());

  const completion = await HabitCompletion.findOne({ habitId, date: dateStr });
  if (!completion) {
    throw new NotFoundError(`No completion record found for ${dateStr}`);
  }

  await HabitCompletion.deleteOne({ _id: completion._id });

  // Recalculate stats and update Habit model cache fields
  const stats = await calculateHabitStats(habitId, userId, habit.startDate);
  habit.currentStreak = stats.currentStreak;
  habit.longestStreak = stats.longestStreak;
  habit.totalCompletions = stats.totalCompletions;
  habit.completionRate = stats.completionRate;
  await habit.save();

  return formatHabitResponse(habit.toObject(), stats);
}

function formatHabitResponse(habitObj, stats) {
  return {
    id: habitObj._id ? habitObj._id.toString() : habitObj.id,
    userId: habitObj.userId.toString(),
    name: habitObj.name,
    description: habitObj.description || '',
    category: habitObj.category,
    icon: habitObj.icon || 'target',
    trackingType: habitObj.trackingType || 'binary',
    frequency: habitObj.frequency,
    customDays: habitObj.customDays || [],
    targetValue: habitObj.targetValue || 1,
    unit: habitObj.unit || 'times',
    preferredTime: habitObj.preferredTime || '',
    timeWindowStart: habitObj.timeWindowStart || '',
    timeWindowEnd: habitObj.timeWindowEnd || '',
    reminderEnabled: Boolean(habitObj.reminderEnabled),
    reminderTime: habitObj.reminderTime || '',
    reminderDays: habitObj.reminderDays || [],
    difficulty: habitObj.difficulty || 'moderate',
    expectedFriction: habitObj.expectedFriction || 'medium',
    checklistItems: habitObj.checklistItems || [],
    startDate: habitObj.startDate,
    color: habitObj.color || '#6366f1',
    isArchived: habitObj.isArchived || false,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    totalCompletions: stats.totalCompletions,
    completionRate: stats.completionRate,
    completedToday: stats.completedToday,
    history: stats.history || {},
    createdAt: habitObj.createdAt ? new Date(habitObj.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: habitObj.updatedAt ? new Date(habitObj.updatedAt).toISOString() : new Date().toISOString(),
  };
}

module.exports = {
  createHabit,
  getHabitsOverview,
  getHabits,
  getHabitById,
  getHabitAnalytics,
  logHabitMiss,
  updateHabit,
  deleteHabit,
  completeHabit,
  uncompleteHabit,
};
