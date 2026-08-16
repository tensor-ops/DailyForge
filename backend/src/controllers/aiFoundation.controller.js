const aiConfig = require('../ai/config/aiConfig');
const PersonalContextEngine = require('../ai/context/PersonalContextEngine');
const HabitSignalEngine = require('../ai/signals/HabitSignalEngine');
const aiMemoryService = require('../ai/memory/aiMemory.service');
const aiUsageService = require('../ai/observability/aiUsage.service');
const retrievalService = require('../ai/rag/retrieval.service');
const RecommendationEngine = require('../ai/recommendations/recommendationEngine.service');
const InsightSynthesizer = require('../ai/insights/insightSynthesizer.service');
const ChatOrchestrator = require('../ai/orchestrator/chatOrchestrator.service');

// Phase 3 Systems
const ForgeAIOrchestrator = require('../ai/orchestrator/ForgeAIOrchestrator');
const NextBestActionEngine = require('../ai/recommendations/nextBestAction.service');
const HabitRiskEngine = require('../ai/signals/HabitRiskEngine');
const CoachingProfileEngine = require('../ai/context/CoachingProfileEngine');
const ExperimentAI = require('../ai/experiments/experimentAI.service');
const ReflectionEngine = require('../ai/reflection/reflectionEngine.service');
const AIActionTransactionService = require('../ai/transactions/aiActionTransaction.service');

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

async function getInsightFeed(req, res, next) {
  try {
    const data = await InsightSynthesizer.getInsightFeed(req.user._id);
    return sendSuccess(res, data, 'Insight feed retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function submitInsightFeedback(req, res, next) {
  try {
    const data = await InsightSynthesizer.submitFeedback(req.user._id, req.params.id, req.body);
    return sendSuccess(res, data, 'Insight feedback recorded');
  } catch (err) {
    next(err);
  }
}

async function getRankedRecommendations(req, res, next) {
  try {
    const recommendations = await RecommendationEngine.getRankedRecommendations(req.user._id);
    return sendSuccess(res, { recommendations, count: recommendations.length }, 'Recommendations retrieved');
  } catch (err) {
    next(err);
  }
}

async function handleRecommendationAction(req, res, next) {
  try {
    const { action } = req.body;
    const updated = await RecommendationEngine.handleAction(req.user._id, req.params.id, action);
    return sendSuccess(res, updated, `Recommendation ${action.toLowerCase()}ed successfully`);
  } catch (err) {
    next(err);
  }
}

async function submitRecommendationFeedback(req, res, next) {
  try {
    const updated = await RecommendationEngine.submitFeedback(req.user._id, req.params.id, req.body);
    return sendSuccess(res, updated, 'Recommendation feedback recorded');
  } catch (err) {
    next(err);
  }
}

async function getDailyBrief(req, res, next) {
  try {
    const brief = await InsightSynthesizer.getDailyBrief(req.user._id);
    return sendSuccess(res, brief, 'Daily Forge Brief retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function getWeeklyReview(req, res, next) {
  try {
    const review = await InsightSynthesizer.getWeeklyReview(req.user._id);
    return sendSuccess(res, review, 'Weekly Forge Review retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function getMonthlyReview(req, res, next) {
  try {
    const review = await InsightSynthesizer.getMonthlyReview(req.user._id);
    return sendSuccess(res, review, 'Monthly Forge Review retrieved successfully');
  } catch (err) {
    next(err);
  }
}

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

async function getChatHistory(req, res, next) {
  try {
    const history = await ChatOrchestrator.getHistory(req.user._id, req.query.conversationId);
    return sendSuccess(res, history, 'Chat history retrieved');
  } catch (err) {
    next(err);
  }
}

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

// --- Phase 3 Handlers ---

/**
 * GET /api/v1/ai/next-best-action
 */
async function getNextBestActions(req, res, next) {
  try {
    const actions = await NextBestActionEngine.computeNextActions(req.user._id);
    return sendSuccess(res, { actions, count: actions.length }, 'Next best actions computed');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/risk-map
 */
async function getHabitRiskMap(req, res, next) {
  try {
    const riskMap = await HabitRiskEngine.computeRiskMap(req.user._id);
    return sendSuccess(res, riskMap, 'Habit risk telemetry computed');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/coaching-profile
 */
async function getCoachingProfile(req, res, next) {
  try {
    const profile = await CoachingProfileEngine.getProfile(req.user._id);
    return sendSuccess(res, profile, 'Personalized coaching profile retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/experiments/generate
 */
async function generateExperimentProposal(req, res, next) {
  try {
    const proposal = await ExperimentAI.generateProposal(req.user._id, req.body.habitId || null);
    return sendSuccess(res, proposal, 'N-of-1 trial proposal generated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/experiments/evaluate/:id
 */
async function evaluateExperiment(req, res, next) {
  try {
    const evaluation = await ExperimentAI.evaluate(req.user._id, req.params.id);
    return sendSuccess(res, evaluation, 'Experiment evaluated with closed-loop learning');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/reflections/prompts
 */
async function getReflectionPrompts(req, res, next) {
  try {
    const prompts = await ReflectionEngine.getReflectionPrompts(req.user._id);
    return sendSuccess(res, { prompts }, 'Reflection prompts retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/reflections/submit
 */
async function submitReflection(req, res, next) {
  try {
    const result = await ReflectionEngine.submitReflection(req.user._id, req.body);
    return sendSuccess(res, result, 'Reflection submitted and stored as episodic memory');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/orchestrator/workflow
 */
async function runOrchestratorWorkflow(req, res, next) {
  try {
    const { prompt } = req.body;
    if (!prompt) return sendError(res, 'Prompt is required', 400);
    const result = await ForgeAIOrchestrator.runWorkflow(req.user._id, prompt);
    return sendSuccess(res, result, 'Workflow completed successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/transactions/rollback/:id
 */
async function rollbackTransaction(req, res, next) {
  try {
    const result = await AIActionTransactionService.rollback(req.user._id, req.params.id);
    return sendSuccess(res, result, 'Transaction rolled back successfully');
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
  // Phase 3
  getNextBestActions,
  getHabitRiskMap,
  getCoachingProfile,
  generateExperimentProposal,
  evaluateExperiment,
  getReflectionPrompts,
  submitReflection,
  runOrchestratorWorkflow,
  rollbackTransaction,
};
