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

// --- Existing AI Coach & Insights APIs ---
router.get('/insights', aiController.getInsights);
router.post('/insights/generate', aiLimiter, aiController.generateInsights);
router.get('/recommendations', aiController.getRecommendations);
router.post('/chat', aiLimiter, validate(chatSchema), aiController.chat);
router.get('/conversations', aiController.getConversations);
router.post('/habits/parse', aiLimiter, aiController.parseHabit);
router.post('/goals/plan', aiLimiter, aiController.planGoal);

module.exports = router;
