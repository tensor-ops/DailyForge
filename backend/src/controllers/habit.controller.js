const habitService = require('../services/habit.service');
const { sendSuccess } = require('../utils/response');

async function createHabit(req, res, next) {
  try {
    const habit = await habitService.createHabit(req.user._id, req.body);
    return sendSuccess(res, habit, 'Habit created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function getHabits(req, res, next) {
  try {
    const data = await habitService.getHabits(req.user._id, req.query);
    return sendSuccess(res, data, 'Habits retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function getHabitById(req, res, next) {
  try {
    const habit = await habitService.getHabitById(req.params.id, req.user._id);
    return sendSuccess(res, habit, 'Habit retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function getHabitAnalytics(req, res, next) {
  try {
    const analytics = await habitService.getHabitAnalytics(req.params.id, req.user._id);
    return sendSuccess(res, analytics, 'Habit analytics retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function logHabitMiss(req, res, next) {
  try {
    const miss = await habitService.logHabitMiss(req.params.habitId, req.user._id, req.body);
    return sendSuccess(res, miss, 'Habit miss recorded successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateHabit(req, res, next) {
  try {
    const habit = await habitService.updateHabit(req.params.id, req.user._id, req.body);
    return sendSuccess(res, habit, 'Habit updated successfully');
  } catch (error) {
    next(error);
  }
}

async function deleteHabit(req, res, next) {
  try {
    const result = await habitService.deleteHabit(req.params.id, req.user._id);
    return sendSuccess(res, result, 'Habit deleted successfully');
  } catch (error) {
    next(error);
  }
}

async function archiveHabit(req, res, next) {
  try {
    const habit = await habitService.updateHabit(req.params.id, req.user._id, { isArchived: true });
    return sendSuccess(res, habit, 'Habit archived successfully');
  } catch (error) {
    next(error);
  }
}

async function completeHabit(req, res, next) {
  try {
    const date = req.body.date || req.query.date;
    const notes = req.body.notes || '';
    const habit = await habitService.completeHabit(req.params.habitId, req.user._id, date, notes);
    return sendSuccess(res, habit, 'Habit marked as completed');
  } catch (error) {
    next(error);
  }
}

async function uncompleteHabit(req, res, next) {
  try {
    const date = req.params.date || req.query.date;
    const habit = await habitService.uncompleteHabit(req.params.habitId, req.user._id, date);
    return sendSuccess(res, habit, 'Habit completion undone');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createHabit,
  getHabits,
  getHabitById,
  getHabitAnalytics,
  logHabitMiss,
  updateHabit,
  deleteHabit,
  archiveHabit,
  completeHabit,
  uncompleteHabit,
};
