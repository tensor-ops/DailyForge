const logger = {
  info: (msg, ...meta) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, ...meta);
    }
  },
  warn: (msg, ...meta) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, ...meta);
    }
  },
  error: (msg, ...meta) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, ...meta);
    }
  },
};

module.exports = logger;
