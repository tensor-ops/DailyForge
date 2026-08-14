const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, result, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    return sendSuccess(res, result, 'User logged in successfully', 200);
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    return sendSuccess(res, { user }, 'User details retrieved', 200);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    return sendSuccess(res, null, 'Logged out successfully', 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  logout,
};
