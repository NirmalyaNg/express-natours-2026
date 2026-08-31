const { Router } = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRouter');

const router = Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(authController.protect, authController.restrictTo('lead-guide', 'admin'), tourController.createTour);

router.get('/top-5-cheap', tourController.aliasTop5Cheap, tourController.getAllTours);

router.get('/tour-stats', tourController.getTourStats);

router.get('/monthly-tour-plan/:year', tourController.getMonthlyTourPlan);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect, tourController.updateTour)
  .delete(authController.protect, tourController.deleteTour);

module.exports = router;
