const express = require('express');
const router = express.Router();
const todayController = require('../controllers/today.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', todayController.getTodayOverview);
router.post('/review', todayController.submitDailyReview);
router.post('/reschedule', todayController.rescheduleItem);

// Focus Sessions — exposed API for FocusSession model
router.post('/focus-session', todayController.logFocusSession);
router.get('/focus-sessions', todayController.getFocusSessions);

module.exports = router;
