const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/planner.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', plannerController.getPlanner);
router.post('/events', plannerController.createEvent);
router.patch('/events/:id', plannerController.updateEvent);
router.delete('/events/:id', plannerController.deleteEvent);
router.post('/events/:id/complete', plannerController.completeEvent);
router.post('/events/reschedule', plannerController.rescheduleEvent);

router.post('/recommendations/apply', plannerController.applyRecommendation);
router.get('/auto-schedule/preview', plannerController.getAutoSchedulePreview);
router.post('/auto-schedule/apply', plannerController.applyAutoSchedule);

module.exports = router;
