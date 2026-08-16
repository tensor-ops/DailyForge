const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Profile endpoints
router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);
router.post('/change-password', profileController.changePassword);
router.get('/export', profileController.exportData);
router.delete('/', profileController.deleteAccount);

module.exports = router;
