const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');
const { calculateHabitStats } = require('./streak.service');
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
    icon: habitObj.icon,
    frequency: habitObj.frequency,
    customDays: habitObj.customDays || [],
    targetValue: habitObj.targetValue || 1,
    unit: habitObj.unit || 'times',
    reminderTime: habitObj.reminderTime || '',
    startDate: habitObj.startDate,
    color: habitObj.color,
    isArchived: habitObj.isArchived,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    totalCompletions: stats.totalCompletions,
    completionRate: stats.completionRate,
    completedToday: stats.completedToday,
    history: stats.history,
    createdAt: habitObj.createdAt ? new Date(habitObj.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: habitObj.updatedAt ? new Date(habitObj.updatedAt).toISOString() : new Date().toISOString(),
  };
}

module.exports = {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  completeHabit,
  uncompleteHabit,
};
