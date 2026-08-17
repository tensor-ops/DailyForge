const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/env');
const { standardLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const { notFoundHandler } = require('./middleware/notFound.middleware');
const { sendSuccess } = require('./utils/response');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const habitRoutes = require('./routes/habit.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const aiRoutes = require('./routes/ai.routes');
const goalRoutes = require('./routes/goal.routes');
const taskRoutes = require('./routes/task.routes');
const plannerRoutes = require('./routes/planner.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const notificationRoutes = require('./routes/notification.routes');
const todayRoutes = require('./routes/today.routes');
const milestoneRoutes = require('./routes/milestone.routes');
const forgeLabRoutes = require('./routes/experiment.routes');
const profileRoutes = require('./routes/profile.routes');

const app = express();

// Security & Parsing Middleware
app.use(helmet());
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175'
];
if (config.clientUrl) {
  allowedOrigins.push(config.clientUrl);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || 
                        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply standard rate limiter
app.use(standardLimiter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStates[mongoose.connection.readyState] || 'unknown';

  return sendSuccess(
    res,
    {
      status: 'healthy',
      database: dbState,
      timestamp: new Date().toISOString(),
      environment: config.env,
      uptimeSeconds: Math.floor(process.uptime()),
    },
    'Backend server operational'
  );
});


// Swagger Open API spec
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'DailyForge API',
    version: '1.0.0',
    description: 'Production-ready REST API for DailyForge Habit, Consistency & Productivity Operating System with Email OTP Auth',
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
      description: 'Local development server',
    },
  ],
  paths: {
    '/auth/send-otp': {
      post: {
        summary: 'Send 6-digit verification OTP to email address',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@gmail.com' },
                  purpose: { type: 'string', enum: ['registration', 'login', 'verification', 'reset_password'], default: 'registration' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Verification code sent successfully (OTP is never returned to client)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Verification code sent' },
                    data: {
                      type: 'object',
                      properties: {
                        maskedEmail: { type: 'string', example: 'u••••@gmail.com' },
                        expiresInMinutes: { type: 'number', example: 5 },
                        resendCooldownSeconds: { type: 'number', example: 60 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error, resend cooldown active, or email limit reached' },
        },
      },
    },
    '/auth/verify-otp': {
      post: {
        summary: 'Verify 6-digit OTP code, authenticate user, and issue JWT session token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@gmail.com' },
                  otp: { type: 'string', minLength: 6, maxLength: 6, example: '483921' },
                  purpose: { type: 'string', enum: ['registration', 'login', 'verification', 'reset_password'], default: 'registration' },
                  name: { type: 'string', example: 'Parth' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP verified successfully and session established',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Email verified successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { type: 'object' },
                        token: { type: 'string' },
                        isNewUser: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid OTP code, expired code, or max attempts exceeded' },
        },
      },
    },
    '/auth/resend-otp': {
      post: {
        summary: 'Resend 6-digit verification OTP code to email address',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@gmail.com' },
                  purpose: { type: 'string', enum: ['registration', 'login', 'verification', 'reset_password'], default: 'registration' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'A new verification code has been sent.' },
          400: { description: 'Cooldown active or hourly limit reached' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get currently authenticated user details',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current user profile returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Log out and invalidate session',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount API V1 Routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/habits', habitRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/planner', plannerRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/today', todayRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/milestones', milestoneRoutes);
app.use('/api/v1/forge-lab', forgeLabRoutes);
app.use('/api/v1/profile', profileRoutes);

// Fallback 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
