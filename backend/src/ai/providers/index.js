const aiConfig = require('../config/aiConfig');
const OpenAIProvider = require('./OpenAIProvider');
const GeminiProvider = require('./GeminiProvider');
const LocalMockProvider = require('./LocalMockProvider');

class AIProviderFactory {
  static getProvider(customConfig = {}) {
    const config = { ...aiConfig, ...customConfig };
    const providerName = (config.provider || 'local').toLowerCase();

    switch (providerName) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      case 'local':
      case 'mock':
      default:
        return new LocalMockProvider(config);
    }
  }
}

module.exports = AIProviderFactory;
