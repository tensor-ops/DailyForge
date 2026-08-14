const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { chatSchema } = require('../validators/ai.validator');
const { aiLimiter } = require('../middleware/rateLimit.middleware');

router.use(authenticate);

router.get('/insights', aiController.getInsights);
router.post('/insights/generate', aiLimiter, aiController.generateInsights);
router.get('/recommendations', aiController.getRecommendations);
router.post('/chat', aiLimiter, validate(chatSchema), aiController.chat);
router.get('/conversations', aiController.getConversations);

module.exports = router;
