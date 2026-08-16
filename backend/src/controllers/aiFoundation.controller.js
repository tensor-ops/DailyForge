const aiConfig = require('../ai/config/aiConfig');
const AIProviderFactory = require('../ai/providers');
const PersonalContextEngine = require('../ai/context/PersonalContextEngine');
const ContextBuilder = require('../ai/context/ContextBuilder');
const HabitSignalEngine = require('../ai/signals/HabitSignalEngine');
const aiMemoryService = require('../ai/memory/aiMemory.service');
const aiUsageService = require('../ai/observability/aiUsage.service');
const retrievalService = require('../ai/rag/retrieval.service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/v1/ai/status
 * Provides status of the AI provider, active models, feature flags, and current personalization coverage.
 */
async function getAIStatus(req, res, next) {
  try {
    const fullContext = await PersonalContextEngine.buildFullContext(req.user._id);

    const data = {
      provider: aiConfig.provider,
      isConfigured: !!aiConfig.apiKey || aiConfig.provider === 'local' || aiConfig.provider === 'mock',
      models: aiConfig.models,
      features: aiConfig.features,
      personalizationCoverage: fullContext.personalizationCoverage,
      activeSignalsCount: fullContext.behavioralSignals.length,
      activeMemoriesCount:
        fullContext.aiMemories.facts.length +
        fullContext.aiMemories.analytic.length +
        fullContext.aiMemories.episodic.length,
    };

    return sendSuccess(res, data, 'AI Foundation status retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/context
 * Returns the structured, authentic personal context representation.
 */
async function getPersonalContext(req, res, next) {
  try {
    const context = await PersonalContextEngine.buildFullContext(req.user._id);
    return sendSuccess(res, context, 'Personal context retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/context/refresh
 */
async function refreshPersonalContext(req, res, next) {
  try {
    const context = await PersonalContextEngine.buildFullContext(req.user._id);
    return sendSuccess(res, context, 'Personal context refreshed successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/signals
 * Returns deterministic behavioral signals extracted from real habit logs.
 */
async function getBehavioralSignals(req, res, next) {
  try {
    const signals = await HabitSignalEngine.extractSignals(req.user._id);
    return sendSuccess(res, { signals, count: signals.length }, 'Behavioral signals extracted successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/memory
 */
async function getMemories(req, res, next) {
  try {
    const memories = await aiMemoryService.getUserMemories(req.user._id, req.query.type || null);
    return sendSuccess(res, { memories, count: memories.length }, 'AI memories retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/memory
 */
async function saveMemory(req, res, next) {
  try {
    const { type, key, value, source, tags, confidence } = req.body;
    if (!type || !key || value === undefined) {
      return sendError(res, 'type, key, and value are required for memory', 400);
    }

    const memory = await aiMemoryService.remember(req.user._id, {
      type,
      key,
      value,
      source: source || 'USER_EXPLICIT',
      tags: tags || [],
      confidence: confidence || 0.95,
    });

    return sendSuccess(res, memory, 'Memory saved successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/ai/memory/:id
 */
async function deleteMemory(req, res, next) {
  try {
    const memory = await aiMemoryService.forget(req.user._id, req.params.id);
    if (!memory) return sendError(res, 'Memory item not found', 404);
    return sendSuccess(res, null, 'Memory invalidated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/usage
 */
async function getUsageStats(req, res, next) {
  try {
    const stats = await aiUsageService.getUserUsageStats(req.user._id);
    return sendSuccess(res, stats, 'AI usage stats retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/rag/search
 */
async function searchKnowledgeBase(req, res, next) {
  try {
    const { query, category, limit } = req.query;
    const results = await retrievalService.searchKnowledge(
      query || '',
      category || null,
      parseInt(limit || '3', 10)
    );
    return sendSuccess(res, { results, count: results.length }, 'Knowledge retrieved successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAIStatus,
  getPersonalContext,
  refreshPersonalContext,
  getBehavioralSignals,
  getMemories,
  saveMemory,
  deleteMemory,
  getUsageStats,
  searchKnowledgeBase,
};
