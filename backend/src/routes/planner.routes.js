const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getPlanner, rescheduleEvent } = require('../controllers/planner.controller');

router.use(authenticate);

router.get('/', getPlanner);
router.post('/reschedule', rescheduleEvent);

module.exports = router;
