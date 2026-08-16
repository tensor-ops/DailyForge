const profileService = require('../services/profile.service');
const { sendSuccess } = require('../utils/response');

async function getProfile(req, res, next) {
  try {
    const profile = await profileService.getCompleteProfile(req.user._id);
    return sendSuccess(res, profile, 'Complete profile retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updated = await profileService.updateProfile(req.user._id, req.body);
    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const result = await profileService.changePassword(req.user._id, req.body);
    return sendSuccess(res, result, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
}

async function exportData(req, res, next) {
  try {
    const exportPayload = await profileService.exportUserData(req.user._id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=dailyforge-export-${req.user._id}.json`);
    return sendSuccess(res, exportPayload, 'User data exported successfully');
  } catch (error) {
    next(error);
  }
}

async function deleteAccount(req, res, next) {
  try {
    const result = await profileService.deleteAccount(req.user._id, req.body.password);
    return sendSuccess(res, result, 'Account deleted successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  exportData,
  deleteAccount,
};
