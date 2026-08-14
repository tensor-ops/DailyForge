const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/overview', analyticsController.getOverview);
router.get('/completion-trend', analyticsController.getCompletionTrend);
router.get('/category-performance', analyticsController.getCategoryPerformance);
router.get('/consistency', analyticsController.getConsistency);

module.exports = router;
