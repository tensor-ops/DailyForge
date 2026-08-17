const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation.middleware');
const {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
} = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { otpSendLimiter, otpVerifyLimiter } = require('../middleware/rateLimit.middleware');

// Email OTP Endpoints
router.post('/send-otp', otpSendLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', otpVerifyLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', otpSendLimiter, validate(resendOtpSchema), authController.resendOtp);

// Traditional Auth Endpoints
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
