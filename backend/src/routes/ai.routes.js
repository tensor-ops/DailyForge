const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const aiFoundationController = require('../controllers/aiFoundation.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { chatSchema } = require('../validators/ai.validator');
const { aiLimiter } = require('../middleware/rateLimit.middleware');

router.use(authenticate);

// --- Phase 1: AI Foundation APIs ---
router.get('/status', aiFoundationController.getAIStatus);
router.get('/context', aiFoundationController.getPersonalContext);
router.post('/context/refresh', aiFoundationController.refreshPersonalContext);
router.get('/signals', aiFoundationController.getBehavioralSignals);

// AI Memory Foundation
router.get('/memory', aiFoundationController.getMemories);
router.post('/memory', aiFoundationController.saveMemory);
router.delete('/memory/:id', aiFoundationController.deleteMemory);

// AI Usage & Telemetry
router.get('/usage', aiFoundationController.getUsageStats);

// Coaching Knowledge Base (RAG)
router.get('/rag/search', aiFoundationController.searchKnowledgeBase);

// --- Phase 2: Forge Insights, Recommendations & Reviews ---
router.get('/insights/feed', aiFoundationController.getInsightFeed);
router.post('/insights/:id/feedback', aiFoundationController.submitInsightFeedback);

router.get('/recommendations/ranked', aiFoundationController.getRankedRecommendations);
router.post('/recommendations/:id/action', aiFoundationController.handleRecommendationAction);
router.post('/recommendations/:id/feedback', aiFoundationController.submitRecommendationFeedback);

router.get('/brief/daily', aiFoundationController.getDailyBrief);
router.get('/review/weekly', aiFoundationController.getWeeklyReview);
router.get('/review/monthly', aiFoundationController.getMonthlyReview);

// --- Phase 2: AI Coach Interactive Agent & Action Confirmation ---
router.post('/chat', aiFoundationController.sendChatMessage);
router.get('/chat/history', aiFoundationController.getChatHistory);
router.post('/actions/confirm', aiFoundationController.confirmAction);

// --- Phase 3: Agentic AI, Next Best Action, Risk Map, Forge Lab AI & Closed-Loop Learning ---
router.get('/next-best-action', aiFoundationController.getNextBestActions);
router.get('/risk-map', aiFoundationController.getHabitRiskMap);
router.get('/coaching-profile', aiFoundationController.getCoachingProfile);
router.post('/experiments/generate', aiFoundationController.generateExperimentProposal);
router.post('/experiments/evaluate/:id', aiFoundationController.evaluateExperiment);
router.get('/reflections/prompts', aiFoundationController.getReflectionPrompts);
router.post('/reflections/submit', aiFoundationController.submitReflection);
router.post('/orchestrator/workflow', aiFoundationController.runOrchestratorWorkflow);
router.post('/transactions/rollback/:id', aiFoundationController.rollbackTransaction);

// --- Legacy fallback routes for backward compatibility ---
router.get('/insights', aiController.getInsights);
router.post('/insights/generate', aiLimiter, aiController.generateInsights);
router.get('/recommendations', aiController.getRecommendations);
router.get('/conversations', aiController.getConversations);
router.post('/habits/parse', aiLimiter, aiController.parseHabit);
router.post('/goals/plan', aiLimiter, aiController.planGoal);

module.exports = router;
