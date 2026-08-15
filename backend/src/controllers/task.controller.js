const Task = require('../models/Task');
const { sendSuccess } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');
const { formatDate } = require('../utils/dates');

async function getTasks(req, res, next) {
  try {
    const filter = { userId: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.goalId) filter.goalId = req.query.goalId;
    if (req.query.habitId) filter.habitId = req.query.habitId;
    if (req.query.date) filter.scheduledStart = req.query.date;

    const list = await Task.find(filter).sort({ scheduledStart: 1, createdAt: -1 });
    return sendSuccess(res, list, 'Tasks retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, priority, scheduledStart, scheduledEnd, estimatedMinutes, goalId, habitId } = req.body;
    
    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      priority: priority || 'medium',
      scheduledStart: scheduledStart || formatDate(new Date()),
      scheduledEnd: scheduledEnd || null,
      estimatedMinutes: estimatedMinutes || 0,
      goalId: goalId || null,
      habitId: habitId || null,
    });

    return sendSuccess(res, task, 'Task created successfully');
  } catch (error) {
    next(error);
  }
}

async function getTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return sendSuccess(res, task, 'Task retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const { title, description, status, priority, scheduledStart, scheduledEnd, estimatedMinutes, actualMinutes } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    if (scheduledStart !== undefined) updateData.scheduledStart = scheduledStart;
    if (scheduledEnd !== undefined) updateData.scheduledEnd = scheduledEnd;
    if (estimatedMinutes !== undefined) updateData.estimatedMinutes = estimatedMinutes;
    if (actualMinutes !== undefined) updateData.actualMinutes = actualMinutes;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return sendSuccess(res, task, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return sendSuccess(res, { id: req.params.id }, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
