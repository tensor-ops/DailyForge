const aiConfig = require('../ai/config/aiConfig');
const PersonalContextEngine = require('../ai/context/PersonalContextEngine');
const HabitSignalEngine = require('../ai/signals/HabitSignalEngine');
const aiMemoryService = require('../ai/memory/aiMemory.service');
const aiUsageService = require('../ai/observability/aiUsage.service');
const retrievalService = require('../ai/rag/retrieval.service');
const RecommendationEngine = require('../ai/recommendations/recommendationEngine.service');
const InsightSynthesizer = require('../ai/insights/insightSynthesizer.service');
const ChatOrchestrator = require('../ai/orchestrator/chatOrchestrator.service');
const { sendSuccess, sendError } = require('../utils/response');

// --- Phase 1 Handlers ---

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

async function getPersonalContext(req, res, next) {
  try {
    const context = await PersonalContextEngine.buildFullContext(req.user._id);
    return sendSuccess(res, context, 'Personal context retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function refreshPersonalContext(req, res, next) {
  try {
    const context = await PersonalContextEngine.buildFullContext(req.user._id);
    return sendSuccess(res, context, 'Personal context refreshed successfully');
  } catch (err) {
    next(err);
  }
}

async function getBehavioralSignals(req, res, next) {
  try {
    const signals = await HabitSignalEngine.extractSignals(req.user._id);
    return sendSuccess(res, { signals, count: signals.length }, 'Behavioral signals extracted successfully');
  } catch (err) {
    next(err);
  }
}

async function getMemories(req, res, next) {
  try {
    const memories = await aiMemoryService.getUserMemories(req.user._id, req.query.type || null);
    return sendSuccess(res, { memories, count: memories.length }, 'AI memories retrieved');
  } catch (err) {
    next(err);
  }
}

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

async function deleteMemory(req, res, next) {
  try {
    const memory = await aiMemoryService.forget(req.user._id, req.params.id);
    if (!memory) return sendError(res, 'Memory item not found', 404);
    return sendSuccess(res, null, 'Memory invalidated successfully');
  } catch (err) {
    next(err);
  }
}

async function getUsageStats(req, res, next) {
  try {
    const stats = await aiUsageService.getUserUsageStats(req.user._id);
    return sendSuccess(res, stats, 'AI usage stats retrieved');
  } catch (err) {
    next(err);
  }
}

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

// --- Phase 2 Handlers ---

/**
 * GET /api/v1/ai/insights/feed
 */
async function getInsightFeed(req, res, next) {
  try {
    const data = await InsightSynthesizer.getInsightFeed(req.user._id);
    return sendSuccess(res, data, 'Insight feed retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/insights/:id/feedback
 */
async function submitInsightFeedback(req, res, next) {
  try {
    const data = await InsightSynthesizer.submitFeedback(req.user._id, req.params.id, req.body);
    return sendSuccess(res, data, 'Insight feedback recorded');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/recommendations/ranked
 */
async function getRankedRecommendations(req, res, next) {
  try {
    const recommendations = await RecommendationEngine.getRankedRecommendations(req.user._id);
    return sendSuccess(res, { recommendations, count: recommendations.length }, 'Recommendations retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/recommendations/:id/action
 */
async function handleRecommendationAction(req, res, next) {
  try {
    const { action } = req.body; // 'APPLY' | 'DISMISS'
    const updated = await RecommendationEngine.handleAction(req.user._id, req.params.id, action);
    return sendSuccess(res, updated, `Recommendation ${action.toLowerCase()}ed successfully`);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/recommendations/:id/feedback
 */
async function submitRecommendationFeedback(req, res, next) {
  try {
    const updated = await RecommendationEngine.submitFeedback(req.user._id, req.params.id, req.body);
    return sendSuccess(res, updated, 'Recommendation feedback recorded');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/brief/daily
 */
async function getDailyBrief(req, res, next) {
  try {
    const brief = await InsightSynthesizer.getDailyBrief(req.user._id);
    return sendSuccess(res, brief, 'Daily Forge Brief retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/review/weekly
 */
async function getWeeklyReview(req, res, next) {
  try {
    const review = await InsightSynthesizer.getWeeklyReview(req.user._id);
    return sendSuccess(res, review, 'Weekly Forge Review retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/review/monthly
 */
async function getMonthlyReview(req, res, next) {
  try {
    const review = await InsightSynthesizer.getMonthlyReview(req.user._id);
    return sendSuccess(res, review, 'Monthly Forge Review retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/chat
 */
async function sendChatMessage(req, res, next) {
  try {
    const { message, conversationId } = req.body;
    if (!message || !message.trim()) {
      return sendError(res, 'Message is required', 400);
    }
    const result = await ChatOrchestrator.sendMessage(req.user._id, message.trim(), conversationId);
    return sendSuccess(res, result, 'Agent response generated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/chat/history
 */
async function getChatHistory(req, res, next) {
  try {
    const history = await ChatOrchestrator.getHistory(req.user._id, req.query.conversationId);
    return sendSuccess(res, history, 'Chat history retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/actions/confirm
 */
async function confirmAction(req, res, next) {
  try {
    const { messageId } = req.body;
    if (!messageId) return sendError(res, 'messageId is required', 400);
    const result = await ChatOrchestrator.confirmAction(req.user._id, messageId);
    return sendSuccess(res, result, 'Action confirmed and executed');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Phase 1
  getAIStatus,
  getPersonalContext,
  refreshPersonalContext,
  getBehavioralSignals,
  getMemories,
  saveMemory,
  deleteMemory,
  getUsageStats,
  searchKnowledgeBase,
  // Phase 2
  getInsightFeed,
  submitInsightFeedback,
  getRankedRecommendations,
  handleRecommendationAction,
  submitRecommendationFeedback,
  getDailyBrief,
  getWeeklyReview,
  getMonthlyReview,
  sendChatMessage,
  getChatHistory,
  confirmAction,
};
