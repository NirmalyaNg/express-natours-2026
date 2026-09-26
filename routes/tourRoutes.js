const { Router } = require('express');
const tourController = require('../controllers/tourController');
const protect = require('../middlewares/protect');
const authorize = require('../middlewares/authorize');
const reviewRouter = require('../routes/reviewRoutes');

const router = Router();

router
  .route('/')
  .get(tourController.getAllTours)
  .post(protect, authorize('lead-guide', 'admin'), tourController.createTour);

// /api/v1/tours/:id/reviews
// router.post('/:id/reviews', protect, authorize('user', 'admin'), reviewController.createReview);

router.use('/:id/reviews', reviewRouter);

router.get('/top-5-cheap', tourController.aliasTop5Cheap, tourController.getAllTours);

router.get('/tour-stats', tourController.getTourStats);

router.get('/tours-within/:distance/center/:latlong/unit/:unit', tourController.getToursWithin);

router.get('/distances/center/:latlong/unit/:unit', tourController.getTourDistances);

router.get(
  '/monthly-tour-plan/:year',
  protect,
  authorize('guide', 'lead-guide', 'admin'),
  tourController.getMonthlyTourPlan,
);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(protect, authorize('lead-guide', 'admin'), tourController.updateTour)
  .delete(protect, authorize('lead-guide', 'admin'), tourController.deleteTour);

module.exports = router;
