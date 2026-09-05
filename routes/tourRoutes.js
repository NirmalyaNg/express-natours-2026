const { Router } = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRouter');

const router = Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, authController.restrictTo('lead-guide', 'admin'), tourController.createTour);

router.get('/top-5-cheap', tourController.aliasTop5Cheap, tourController.getAllTours);

router.get('/tour-stats', tourController.getTourStats);

router.get(
  '/monthly-tour-plan/:year',
  authController.protect,
  authController.restrictTo('guide', 'lead-guide', 'admin'),
  tourController.getMonthlyTourPlan,
);

router.route('/tours-within/:distance/center/:latlong/unit/:unit').get(tourController.getToursWithin);
router.route('/distances/:latlong/unit/:unit').get(tourController.getDistances);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect, authController.restrictTo('lead-guide', 'admin'), tourController.updateTour)
  .delete(authController.protect, authController.restrictTo('lead-guide', 'admin'), tourController.deleteTour);

module.exports = router;
