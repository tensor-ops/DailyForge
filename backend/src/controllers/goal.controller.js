const goalService = require('../services/goal.service');
const { sendSuccess, sendError } = require('../utils/response');

async function getGoals(req, res, next) {
  try {
    const data = await goalService.getGoals(req.user._id, req.query);
    return sendSuccess(res, data, 'Goals retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function getGoal(req, res, next) {
  try {
    const goal = await goalService.getGoalById(req.user._id, req.params.id);
    if (!goal) {
      return sendError(res, 'Goal not found', 404);
    }
    return sendSuccess(res, goal, 'Goal retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function createGoal(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return sendError(res, 'Goal name must be at least 2 characters', 400);
    }

    const goal = await goalService.createGoal(req.user._id, req.body);
    return sendSuccess(res, goal, 'Goal created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateGoal(req, res, next) {
  try {
    const goal = await goalService.updateGoal(req.user._id, req.params.id, req.body);
    if (!goal) {
      return sendError(res, 'Goal not found', 404);
    }
    return sendSuccess(res, goal, 'Goal updated successfully');
  } catch (error) {
    next(error);
  }
}

async function deleteGoal(req, res, next) {
  try {
    const goal = await goalService.deleteGoal(req.user._id, req.params.id);
    if (!goal) {
      return sendError(res, 'Goal not found', 404);
    }
    return sendSuccess(res, null, 'Goal deleted successfully');
  } catch (error) {
    next(error);
  }
}

async function archiveGoal(req, res, next) {
  try {
    const goal = await goalService.archiveGoal(req.user._id, req.params.id);
    if (!goal) {
      return sendError(res, 'Goal not found', 404);
    }
    return sendSuccess(res, goal, 'Goal archived successfully');
  } catch (error) {
    next(error);
  }
}

async function togglePause(req, res, next) {
  try {
    const goal = await goalService.togglePauseGoal(req.user._id, req.params.id);
    if (!goal) {
      return sendError(res, 'Goal not found', 404);
    }
    return sendSuccess(res, goal, 'Goal pause status updated');
  } catch (error) {
    next(error);
  }
}

async function duplicateGoal(req, res, next) {
  try {
    const goal = await goalService.duplicateGoal(req.user._id, req.params.id);
    if (!goal) {
      return sendError(res, 'Goal not found', 404);
    }
    return sendSuccess(res, goal, 'Goal duplicated successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function addMilestone(req, res, next) {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return sendError(res, 'Milestone title is required', 400);
    }
    const goal = await goalService.addMilestone(req.user._id, req.params.id, req.body);
    return sendSuccess(res, goal, 'Milestone added successfully');
  } catch (error) {
    next(error);
  }
}

async function updateMilestone(req, res, next) {
  try {
    const goal = await goalService.updateMilestone(
      req.user._id,
      req.params.id,
      req.params.milestoneId,
      req.body
    );
    return sendSuccess(res, goal, 'Milestone updated successfully');
  } catch (error) {
    next(error);
  }
}

async function deleteMilestone(req, res, next) {
  try {
    const goal = await goalService.deleteMilestone(
      req.user._id,
      req.params.id,
      req.params.milestoneId
    );
    return sendSuccess(res, goal, 'Milestone removed successfully');
  } catch (error) {
    next(error);
  }
}

async function linkHabit(req, res, next) {
  try {
    const { habitId } = req.body;
    const goal = await goalService.linkHabit(req.user._id, req.params.id, habitId);
    return sendSuccess(res, goal, 'Habit linked to goal');
  } catch (error) {
    next(error);
  }
}

async function unlinkHabit(req, res, next) {
  try {
    const goal = await goalService.unlinkHabit(req.user._id, req.params.id, req.params.habitId);
    return sendSuccess(res, goal, 'Habit unlinked from goal');
  } catch (error) {
    next(error);
  }
}

async function linkTask(req, res, next) {
  try {
    const { taskId } = req.body;
    const goal = await goalService.linkTask(req.user._id, req.params.id, taskId);
    return sendSuccess(res, goal, 'Task linked to goal');
  } catch (error) {
    next(error);
  }
}

async function unlinkTask(req, res, next) {
  try {
    const goal = await goalService.unlinkTask(req.user._id, req.params.id, req.params.taskId);
    return sendSuccess(res, goal, 'Task unlinked from goal');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  archiveGoal,
  togglePause,
  duplicateGoal,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  linkHabit,
  unlinkHabit,
  linkTask,
  unlinkTask,
};
