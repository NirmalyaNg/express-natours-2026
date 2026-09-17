const Review = require('../models/reviewModel');
const { deleteOne, updateOne, getAll, create, getOne } = require('./handlerFactory');

// Creating a review:

// review content
// user ->
// tour ->
// rating(optional)

// createReview -> controller

// Protected route:
// /api/v1/tours/:id/reviews (POST) -> createReview -> controller
//  tour id -> params
//  user id -> req.user
//  review content -> ?
//  rating -> ?

// Protected route:
// /api/v1/reviews (POST) -> createReview -> controller
// tour id -> ?
// user id -> req.user
// review content -> ?
// rating -> ?

exports.updateFilter = (req, res, next) => {
  req.filterObj = {};
  if (req.params.id) {
    req.filterObj.tour = req.params.id;
  }
  next();
};

exports.updateBody = (req, res, next) => {
  if (req.params.id) {
    req.body.tour = req.params.id;
  }

  if (req.user._id) {
    req.body.user = req.user._id;
  }
  next();
};

exports.getReview = getOne(Review);
exports.createReview = create(Review);
exports.getAllReviews = getAll(Review);
exports.updateReview = updateOne(Review);
exports.deleteRevew = deleteOne(Review);
