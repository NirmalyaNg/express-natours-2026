const { Router } = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const protect = require('../middlewares/protect');

const router = Router();

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router.route('/me').patch(protect, userController.updateMe).delete(protect, userController.deleteMe);
// Only authenticated users will be able to update their password
router.patch('/updateMyPassword', protect, authController.updateMyPassword);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

module.exports = router;
