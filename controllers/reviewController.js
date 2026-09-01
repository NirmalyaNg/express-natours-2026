const Review = require('../models/reviewModel');
const {
  deleteOne,
  createOne,
  updateOne,
  getOne,
  getAll,
} = require('./handlerFactory');

exports.updateRequestBody = (req, res, next) => {
  if (req.params.tourId) {
    req.body.tour = req.params.tourId;
  }
  if (req.user._id) {
    req.body.user = req.user._id;
  }
  next();
};

// Turn nested-route params into a query filter for getAll
exports.setTourFilter = (req, res, next) => {
  if (req.params.tourId) {
    req.filterObj = { tour: req.params.tourId };
  }
  next();
};

// Get all reviews (also handles nested GET /tours/:tourId/reviews)
exports.getAllReviews = getAll(Review);
// Get a review
exports.getReview = getOne(Review);
// Create a review
exports.createReview = createOne(Review);
// Update a review
exports.updateReview = updateOne(Review);
// Delete a review
exports.deleteReview = deleteOne(Review);
