const app = require('./app');
const config = require('./config/env');
const { connectDatabase } = require('./config/database');
const logger = require('./utils/logger');

async function startServer() {
  const server = app.listen(config.port, () => {
    logger.info(`🚀 Backend server running in ${config.env} mode on http://localhost:${config.port}`);
    logger.info(`📚 Swagger API Docs available at http://localhost:${config.port}/api/docs`);
    logger.info(`❤️ Health check available at http://localhost:${config.port}/health`);
  });

  // Connect to MongoDB asynchronously
  try {
    await connectDatabase();
  } catch (err) {
    logger.warn(`⚠️ Started Express server, but MongoDB connection pending/failed: ${err.message}`);
  }

  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer();
