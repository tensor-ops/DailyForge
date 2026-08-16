const plannerService = require('../services/planner.service');
const autoScheduleService = require('../services/autoSchedule.service');
const { sendSuccess, sendError } = require('../utils/response');

async function getPlanner(req, res, next) {
  try {
    const data = await plannerService.getPlannerOverview(req.user._id, req.query);
    return sendSuccess(res, data, 'Planner details retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function createEvent(req, res, next) {
  try {
    const { title, date, startTime, endTime } = req.body;
    if (!title || !date || !startTime || !endTime) {
      return sendError(res, 'Title, date, start time, and end time are required.', 400);
    }
    const data = await plannerService.createEvent(req.user._id, req.body);
    return sendSuccess(res, data, 'Event scheduled successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateEvent(req, res, next) {
  try {
    const data = await plannerService.updateEvent(req.user._id, req.params.id, req.body);
    if (!data) {
      return sendError(res, 'Event not found', 404);
    }
    return sendSuccess(res, data, 'Event updated successfully');
  } catch (error) {
    next(error);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const data = await plannerService.deleteEvent(req.user._id, req.params.id);
    if (!data) {
      return sendError(res, 'Event not found', 404);
    }
    return sendSuccess(res, null, 'Event deleted successfully');
  } catch (error) {
    next(error);
  }
}

async function completeEvent(req, res, next) {
  try {
    const data = await plannerService.completeEvent(req.user._id, req.params.id);
    if (!data) {
      return sendError(res, 'Event not found', 404);
    }
    return sendSuccess(res, data, 'Event marked complete');
  } catch (error) {
    next(error);
  }
}

async function rescheduleEvent(req, res, next) {
  try {
    const data = await plannerService.rescheduleEvent(req.user._id, req.body);
    return sendSuccess(res, data, 'Event rescheduled successfully');
  } catch (error) {
    next(error);
  }
}

async function applyRecommendation(req, res, next) {
  try {
    const data = await plannerService.applyRecommendation(req.user._id, req.body);
    return sendSuccess(res, data, 'Recommendation applied and schedule balanced');
  } catch (error) {
    next(error);
  }
}

async function getAutoSchedulePreview(req, res, next) {
  try {
    const data = await autoScheduleService.generateAutoSchedulePreview(
      req.user._id,
      req.query.date
    );
    return sendSuccess(res, data, 'Auto schedule preview generated');
  } catch (error) {
    next(error);
  }
}

async function applyAutoSchedule(req, res, next) {
  try {
    const { date, events } = req.body;
    await autoScheduleService.applyAutoSchedule(req.user._id, date, events);
    const data = await plannerService.getPlannerOverview(req.user._id, { date });
    return sendSuccess(res, data, 'Optimized schedule applied successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPlanner,
  createEvent,
  updateEvent,
  deleteEvent,
  completeEvent,
  rescheduleEvent,
  applyRecommendation,
  getAutoSchedulePreview,
  applyAutoSchedule,
};
