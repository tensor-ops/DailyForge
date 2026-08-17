const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const standardLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      details: null,
    },
  },
});

const aiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.aiMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI usage rate limit reached. Please wait a few minutes before asking AI again.',
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      details: null,
    },
  },
});

// Dedicated limiter for sending OTPs to prevent email flooding
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 send-otp calls per IP per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification requests. Please wait before requesting another code.',
    error: {
      code: 'OTP_RATE_LIMIT_EXCEEDED',
      details: null,
    },
  },
});

// Dedicated limiter for verifying OTPs to prevent brute-force guesses
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 verify attempts per IP per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts. Please wait a few minutes before trying again.',
    error: {
      code: 'VERIFY_RATE_LIMIT_EXCEEDED',
      details: null,
    },
  },
});

module.exports = {
  standardLimiter,
  aiLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
};
