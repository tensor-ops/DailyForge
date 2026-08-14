const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getGoals, createGoal, getGoal, updateGoal, deleteGoal } = require('../controllers/goal.controller');

router.use(authenticate);

router.get('/', getGoals);
router.post('/', createGoal);
router.get('/:id', getGoal);
router.patch('/:id', updateGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
