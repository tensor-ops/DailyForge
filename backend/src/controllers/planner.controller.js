const Habit = require('../models/Habit');
const Task = require('../models/Task');
const FocusSession = require('../models/FocusSession');
const behaviorAnalyticsService = require('../services/behaviorAnalytics.service');
const { formatDate } = require('../utils/dates');
const { sendSuccess } = require('../utils/response');

async function getPlanner(req, res, next) {
  try {
    const userId = req.user._id;
    const dateStr = req.query.date || formatDate(new Date());

    // Fetch active habits
    const habits = await Habit.find({ userId, isArchived: false }).lean();
    
    // Fetch tasks scheduled for this date
    const tasks = await Task.find({ userId, scheduledStart: dateStr }).lean();

    // Fetch focus sessions for this date
    // Set start & end boundary times
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);
    
    const focusSessions = await FocusSession.find({
      userId,
      startedAt: { $gte: startOfDay, $lte: endOfDay },
    }).lean();

    // Capacity calculations
    const behaviorData = await behaviorAnalyticsService.getBehaviorAnalytics(userId, '30d');
    const availableMinutes = behaviorData.isBaselineBuilding
      ? 260 // Default 4h 20m available
      : Math.round(behaviorData.focusCapacity.capacityHours * 60);

    const plannedTaskMinutes = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
    const plannedHabitMinutes = habits.length * 30; // Proxy 30 mins per active habit
    const plannedMinutes = plannedTaskMinutes + plannedHabitMinutes;

    const isOverloaded = plannedMinutes > availableMinutes;
    const shiftRecommendation = isOverloaded
      ? {
          type: 'scheduling',
          action: 'Postpone Reading to Tomorrow',
          reason: 'Moving Reading reduces planned workload to balance available focus capacity.',
          habitName: 'Reading',
        }
      : null;

    return sendSuccess(res, {
      date: dateStr,
      habits: habits.map(h => ({
        id: h._id.toString(),
        name: h.name,
        category: h.category,
        color: h.color || '#3B82F6',
        preferredTime: h.preferredTime || '08:00 AM',
        durationMinutes: 30,
      })),
      tasks: tasks.map(t => ({
        id: t._id.toString(),
        title: t.title,
        status: t.status,
        priority: t.priority,
        estimatedMinutes: t.estimatedMinutes,
        actualMinutes: t.actualMinutes,
      })),
      focusSessions: focusSessions.map(f => ({
        id: f._id.toString(),
        durationMinutes: f.durationMinutes,
        focusQuality: f.focusQuality,
      })),
      capacity: {
        availableMinutes,
        plannedMinutes,
        isOverloaded,
        status: isOverloaded ? 'OVER_CAPACITY' : plannedMinutes >= availableMinutes * 0.85 ? 'NEAR_LIMIT' : 'BALANCED',
        shiftRecommendation,
      },
    }, 'Planner details retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function rescheduleEvent(req, res, next) {
  try {
    const { id, type, newDate } = req.body;
    
    if (type === 'task') {
      const task = await Task.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { scheduledStart: newDate },
        { new: true }
      );
      return sendSuccess(res, task, 'Task rescheduled successfully');
    } else if (type === 'habit') {
      const habit = await Habit.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { preferredTime: newDate }, // tweak scheduled preferred timings
        { new: true }
      );
      return sendSuccess(res, habit, 'Habit rescheduled successfully');
    }

    return res.status(400).json({ error: { code: 'INVALID_TYPE', message: 'Rescheduling supports tasks and habits only.' } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPlanner,
  rescheduleEvent,
};
