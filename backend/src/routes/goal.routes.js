const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Main Goal CRUD & actions
router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.get('/:id', goalController.getGoal);
router.patch('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

router.post('/:id/archive', goalController.archiveGoal);
router.post('/:id/pause', goalController.togglePause);
router.post('/:id/duplicate', goalController.duplicateGoal);

// Milestone routes
router.post('/:id/milestones', goalController.addMilestone);
router.patch('/:id/milestones/:milestoneId', goalController.updateMilestone);
router.delete('/:id/milestones/:milestoneId', goalController.deleteMilestone);

// Habit connection routes
router.post('/:id/habits', goalController.linkHabit);
router.delete('/:id/habits/:habitId', goalController.unlinkHabit);

// Task connection routes
router.post('/:id/tasks', goalController.linkTask);
router.delete('/:id/tasks/:taskId', goalController.unlinkTask);

module.exports = router;
