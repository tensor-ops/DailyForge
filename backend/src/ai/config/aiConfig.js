/**
 * Centralized AI Configuration for DailyForge
 */

const aiConfig = {
  // Provider Selection: 'openai' | 'gemini' | 'local' | 'mock'
  provider: process.env.AI_PROVIDER || 'local',
  apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '',

  // Model Selection
  models: {
    fast: process.env.AI_FAST_MODEL || 'gpt-4o-mini',
    reasoning: process.env.AI_REASONING_MODEL || 'gpt-4o',
    embedding: process.env.AI_EMBEDDING_MODEL || 'text-embedding-3-small',
  },

  // Hyperparameters
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3'),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048', 10),
  timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '15000', 10),
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || '2', 10),

  // Feature Flags
  features: {
    enabled: process.env.AI_FEATURES_ENABLED !== 'false',
    insights: process.env.AI_INSIGHTS_ENABLED !== 'false',
    coach: process.env.AI_COACH_ENABLED !== 'false',
    recommendations: process.env.AI_RECOMMENDATIONS_ENABLED !== 'false',
    experiments: process.env.AI_EXPERIMENTS_ENABLED !== 'false',
    rag: process.env.AI_RAG_ENABLED !== 'false',
  },

  // Cost estimates per 1k tokens (in USD)
  pricing: {
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
    'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
    'local': { input: 0.0, output: 0.0 },
    'mock': { input: 0.0, output: 0.0 },
  },
};

module.exports = aiConfig;
