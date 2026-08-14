const { AppError } = require('../utils/errors');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof AppError)) {
    // Mongoose duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      error = new AppError(`Duplicate value entered for ${field}`, 409, 'DUPLICATE_KEY_ERROR');
    } else if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map((e) => e.message);
      error = new AppError('Database Validation Failed', 400, 'VALIDATION_ERROR', details);
    } else if (error.name === 'CastError') {
      error = new AppError(`Invalid format for ${error.path}`, 400, 'INVALID_ID');
    } else {
      logger.error('Unhandled Server Error:', err);
      error = new AppError(
        process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        500,
        'SERVER_ERROR'
      );
    }
  }

  return sendError(
    res,
    error.message,
    error.statusCode || 500,
    error.code || 'SERVER_ERROR',
    error.details || null
  );
}

module.exports = { errorHandler };
