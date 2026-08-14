const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

async function getProfile(req, res, next) {
  try {
    const profile = await userService.getUserProfile(req.user._id);
    return sendSuccess(res, profile, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updated = await userService.updateUserProfile(req.user._id, req.body);
    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
