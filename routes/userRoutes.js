const { Router } = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = Router();

// public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// protected routes
router.use(authController.protect);
router.patch('/updateMyPassword', authController.updateMyPassword);
router.route('/me').patch(userController.updateMe).delete(userController.deleteMe);

// protected routes + authorization(admin)
router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
