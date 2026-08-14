const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habit.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  createHabitSchema,
  updateHabitSchema,
  completeHabitSchema,
} = require('../validators/habit.validator');

router.use(authenticate);

router.get('/', habitController.getHabits);
router.post('/', validate(createHabitSchema), habitController.createHabit);

router.get('/:id', habitController.getHabitById);
router.patch('/:id', validate(updateHabitSchema), habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);
router.patch('/:id/archive', habitController.archiveHabit);

router.post('/:habitId/complete', validate(completeHabitSchema), habitController.completeHabit);
router.delete('/:habitId/complete/:date?', habitController.uncompleteHabit);

module.exports = router;
