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

module.exports = {
  standardLimiter,
  aiLimiter,
};
