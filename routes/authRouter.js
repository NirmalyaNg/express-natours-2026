const express = require('express');
const authController = require('../controllers/authController');
const protect = require('../middlewares/protect');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch('/change-password', protect, authController.changePassword);

module.exports = router;
