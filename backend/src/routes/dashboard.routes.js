const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getOverview, getTodayCockpit } = require('../controllers/dashboard.controller');

router.use(authenticate);

router.get('/overview', getOverview);
router.get('/today', getTodayCockpit);

module.exports = router;
