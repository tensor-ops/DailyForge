const express = require('express');
const router = express.Router();
const experimentController = require('../controllers/experiment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/overview', experimentController.getOverview);
router.get('/experiments', experimentController.getOverview);
router.post('/experiments', experimentController.create);
router.get('/experiments/:id', experimentController.getExperimentById);
router.patch('/experiments/:id/status', experimentController.updateStatus);
router.post('/experiments/:id/apply', experimentController.applyResult);

module.exports = router;
