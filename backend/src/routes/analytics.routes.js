const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Legacy routes
router.get('/overview', analyticsController.getOverview);
router.get('/completion-trend', analyticsController.getCompletionTrend);
router.get('/category-performance', analyticsController.getCategoryPerformance);
router.get('/consistency', analyticsController.getConsistency);

// Behavioral Intelligence routes
router.get('/behavior', analyticsController.getBehaviorOverview);
router.post('/energy-log', analyticsController.createEnergyLog);
router.post('/habit-miss', analyticsController.createHabitMiss);

// Experiment Framework routes
router.get('/experiments', analyticsController.getExperiments);
router.post('/experiments', analyticsController.createExperiment);
router.patch('/experiments/:id', analyticsController.updateExperiment);

module.exports = router;
