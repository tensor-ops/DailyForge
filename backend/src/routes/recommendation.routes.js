const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getRecommendations, acceptRecommendation, rejectRecommendation } = require('../controllers/recommendation.controller');

router.use(authenticate);

router.get('/', getRecommendations);
router.post('/:id/accept', acceptRecommendation);
router.post('/:id/reject', rejectRecommendation);

module.exports = router;
