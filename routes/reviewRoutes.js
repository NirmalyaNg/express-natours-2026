const express = require('express');
const reviewController = require('../controllers/reviewController');
const protect = require('../middlewares/protect');
const authorize = require('../middlewares/authorize');

const router = express.Router({
  mergeParams: true,
});

router
  .route('/')
  .post(protect, authorize('user', 'admin'), reviewController.updateBody, reviewController.createReview)
  .get(reviewController.updateFilter, reviewController.getAllReviews);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(protect, authorize('user', 'admin'), reviewController.updateReview)
  .delete(protect, authorize('user', 'admin'), reviewController.deleteReview);

// http://localhost:8000/api/v1/tours/hadkjjb3j4bkj4bkj4k3/reviews
// tourid -> req.params
// userid -> req.user

module.exports = router;
