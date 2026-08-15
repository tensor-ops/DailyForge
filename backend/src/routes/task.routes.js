const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getTasks, createTask, getTask, updateTask, deleteTask } = require('../controllers/task.controller');

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
