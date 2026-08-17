const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

async function sendOtp(req, res, next) {
  try {
    const result = await authService.sendOtp({
      email: req.body.email,
      purpose: req.body.purpose || 'registration',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return sendSuccess(res, result, 'Verification code sent', 200);
  } catch (error) {
    next(error);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const result = await authService.verifyOtp({
      email: req.body.email,
      otp: req.body.otp,
      purpose: req.body.purpose || 'registration',
      name: req.body.name,
    });
    return sendSuccess(res, result, 'Email verified successfully', 200);
  } catch (error) {
    next(error);
  }
}

async function resendOtp(req, res, next) {
  try {
    const result = await authService.resendOtp({
      email: req.body.email,
      purpose: req.body.purpose || 'registration',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return sendSuccess(res, result, 'A new verification code has been sent.', 200);
  } catch (error) {
    next(error);
  }
}

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
  sendOtp,
  verifyOtp,
  resendOtp,
  register,
  login,
  getMe,
  logout,
};
