const config = require('./env');

const aiConfig = {
  provider: config.ai.provider,
  apiKey: config.ai.apiKey,
  model: config.ai.model,
  isMock: config.ai.provider === 'mock' || !config.ai.apiKey,
};

module.exports = aiConfig;
