const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { updateProfileSchema } = require('../validators/user.validator');

router.use(authenticate);

// Legacy user endpoints
router.get('/me', userController.getProfile);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.patch('/me/preferences', validate(updateProfileSchema), userController.updateProfile);

// Comprehensive Profile endpoints
router.get('/profile', profileController.getProfile);
router.patch('/profile', profileController.updateProfile);
router.post('/change-password', profileController.changePassword);
router.get('/export', profileController.exportData);
router.delete('/profile', profileController.deleteAccount);

module.exports = router;
