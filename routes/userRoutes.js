const { Router } = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:resetToken').patch(authController.resetPassword);
router.route('/changeMyPassword').patch(authMiddleware.protect, authController.changeMyPassword);
router
  .route('/me')
  .patch(authMiddleware.protect, userController.updateMe)
  .delete(authMiddleware.protect, userController.deleteMe);
router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser);

module.exports = router;
