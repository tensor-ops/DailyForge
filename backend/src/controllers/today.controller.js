const todayService = require('../services/today.service');
const { sendSuccess } = require('../utils/response');

async function getTodayOverview(req, res, next) {
  try {
    const data = await todayService.getTodayOverview(req.user._id, req.query.date);
    return sendSuccess(res, data, 'Today overview retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function submitDailyReview(req, res, next) {
  try {
    const data = await todayService.submitDailyReview(req.user._id, req.body);
    return sendSuccess(res, data, 'Daily review submitted successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function rescheduleItem(req, res, next) {
  try {
    const data = await todayService.rescheduleItem(req.user._id, req.body);
    return sendSuccess(res, data, 'Item rescheduled successfully');
  } catch (error) {
    next(error);
  }
}

async function logFocusSession(req, res, next) {
  try {
    const data = await todayService.logFocusSession(req.user._id, req.body);
    return sendSuccess(res, data, 'Focus session logged successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function getFocusSessions(req, res, next) {
  try {
    const data = await todayService.getFocusSessions(req.user._id, req.query.date);
    return sendSuccess(res, data, 'Focus sessions retrieved successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTodayOverview,
  submitDailyReview,
  rescheduleItem,
  logFocusSession,
  getFocusSessions,
};
