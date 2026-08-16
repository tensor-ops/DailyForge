const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Habit Intelligence Core Endpoints
router.get('/overview', analyticsController.getOverview);
router.get('/growth', analyticsController.getGrowth);
router.get('/momentum', analyticsController.getMomentum);
router.get('/habits/:id/snapshot', analyticsController.getHabitSnapshot);

// Behavioral Intelligence routes
router.get('/behavior', analyticsController.getBehaviorOverview);
router.post('/energy-log', analyticsController.createEnergyLog);
router.post('/habit-miss', analyticsController.createHabitMiss);

// Experiment Framework routes
router.get('/experiments', analyticsController.getExperiments);
router.post('/experiments', analyticsController.createExperiment);
router.patch('/experiments/:id', analyticsController.updateExperiment);

module.exports = router;
