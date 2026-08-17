const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  appName: process.env.APP_NAME || 'DailyForge',
  frontendUrl: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-habit-tracker',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'super_secret_jwt_access_key_change_in_production_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_change_in_production_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // OTP Configuration
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10),
    resendSeconds: parseInt(process.env.OTP_RESEND_SECONDS || '60', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),
    maxRequestsPerHour: parseInt(process.env.OTP_MAX_REQUESTS_PER_HOUR || '5', 10),
    pepperSecret: process.env.OTP_PEPPER_SECRET || 'daily_forge_otp_secret_pepper_2026',
  },

  // Email / Gmail Configuration
  email: {
    provider: process.env.EMAIL_PROVIDER || (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN ? 'gmail' : 'console'),
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    senderEmail: process.env.GMAIL_SENDER_EMAIL || process.env.EMAIL_FROM || 'dailyforge.app@gmail.com',
    senderName: process.env.EMAIL_SENDER_NAME || 'DailyForge Security',
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'mock',
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    aiMaxRequests: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS || '20', 10),
  },
};

module.exports = config;
