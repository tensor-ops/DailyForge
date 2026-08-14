const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * GET /api/v1/goals
 * Get all goals for authenticated user
 */
async function getGoals(req, res) {
  try {
    const goals = await Goal.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Compute real-time progress for each goal based on linked habits
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const habitProgress = await computeGoalProgress(goal);
        return { ...goal, id: goal._id.toString(), progress: habitProgress };
      })
    );

    return successResponse(res, { goals: goalsWithProgress }, 'Goals retrieved');
  } catch (err) {
    logger.error(`getGoals error: ${err.message}`);
    return errorResponse(res, 'Failed to retrieve goals', 500);
  }
}

/**
 * POST /api/v1/goals
 * Create a new goal
 */
async function createGoal(req, res) {
  try {
    const { name, description, emoji, color, targetValue, deadline, habits, milestones } = req.body;

    if (!name || name.trim().length < 2) {
      return errorResponse(res, 'Goal name must be at least 2 characters', 400);
    }

    const goal = await Goal.create({
      userId: req.user.id,
      name: name.trim(),
      description: description || '',
      emoji: emoji || '🎯',
      color: color || '#6366f1',
      targetValue: targetValue || 100,
      deadline: deadline || null,
      habits: habits || [],
      milestones: milestones || [],
    });

    return successResponse(res, { ...goal.toJSON() }, 'Goal created', 201);
  } catch (err) {
    logger.error(`createGoal error: ${err.message}`);
    return errorResponse(res, 'Failed to create goal', 500);
  }
}

/**
 * GET /api/v1/goals/:id
 * Get a single goal
 */
async function getGoal(req, res) {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!goal) {
      return errorResponse(res, 'Goal not found', 404);
    }

    const progress = await computeGoalProgress(goal);
    return successResponse(res, { ...goal, id: goal._id.toString(), progress }, 'Goal retrieved');
  } catch (err) {
    logger.error(`getGoal error: ${err.message}`);
    return errorResponse(res, 'Failed to retrieve goal', 500);
  }
}

/**
 * PATCH /api/v1/goals/:id
 * Update a goal
 */
async function updateGoal(req, res) {
  try {
    const allowed = ['name', 'description', 'emoji', 'color', 'targetValue', 'deadline', 'habits', 'status', 'milestones'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!goal) {
      return errorResponse(res, 'Goal not found', 404);
    }

    const progress = await computeGoalProgress(goal);
    return successResponse(res, { ...goal, id: goal._id.toString(), progress }, 'Goal updated');
  } catch (err) {
    logger.error(`updateGoal error: ${err.message}`);
    return errorResponse(res, 'Failed to update goal', 500);
  }
}

/**
 * DELETE /api/v1/goals/:id
 * Delete a goal
 */
async function deleteGoal(req, res) {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return errorResponse(res, 'Goal not found', 404);
    }
    return successResponse(res, null, 'Goal deleted');
  } catch (err) {
    logger.error(`deleteGoal error: ${err.message}`);
    return errorResponse(res, 'Failed to delete goal', 500);
  }
}

/**
 * Compute aggregate progress for a goal based on its linked habits' completion rates
 */
async function computeGoalProgress(goal) {
  if (!goal.habits || goal.habits.length === 0) return 0;

  try {
    const habits = await Habit.find({ _id: { $in: goal.habits } }).lean();
    if (habits.length === 0) return 0;

    const totalRate = habits.reduce((sum, h) => sum + (h.completionRate || 0), 0);
    return Math.round(totalRate / habits.length);
  } catch {
    return 0;
  }
}

module.exports = { getGoals, createGoal, getGoal, updateGoal, deleteGoal };
