const { Router } = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const protect = require('../middlewares/protect');
const authorize = require('../middlewares/authorize');

const router = Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protected routes
router.use(protect);

router
  .route('/me')
  .patch(userController.updateMe)
  .delete(userController.deleteMe)
  .get(userController.updateParams, userController.getUser);
router.patch('/updateMyPassword', authController.updateMyPassword);

// (Protected + authorized) routes
router.use(authorize('admin'));

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
