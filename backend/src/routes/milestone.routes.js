const express = require('express');
const router = express.Router();
const milestoneController = require('../controllers/milestone.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/overview', milestoneController.getOverview);
router.get('/achievements', milestoneController.getAchievements);
router.get('/moments', milestoneController.getMoments);
router.post('/moments/:code/pin', milestoneController.togglePin);

module.exports = router;
