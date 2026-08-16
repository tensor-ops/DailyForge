const milestoneService = require('../services/milestone.service');
const { sendSuccess, sendError } = require('../utils/response');

async function getOverview(req, res, next) {
  try {
    const data = await milestoneService.getMilestonesOverview(req.user._id);
    return sendSuccess(res, data, 'Milestones overview retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function getAchievements(req, res, next) {
  try {
    const data = await milestoneService.getMilestonesOverview(req.user._id);
    return sendSuccess(res, {
      allAchievements: data.allAchievements,
      unlocked: data.unlockedAchievements,
      locked: data.lockedAchievements,
    }, 'Achievements retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function getMoments(req, res, next) {
  try {
    const data = await milestoneService.getMilestonesOverview(req.user._id);
    return sendSuccess(res, data.moments, 'Moments retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function togglePin(req, res, next) {
  try {
    const result = await milestoneService.togglePinMoment(req.user._id, req.params.code);
    return sendSuccess(res, result, 'Moment pin state updated successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
  getAchievements,
  getMoments,
  togglePin,
};
