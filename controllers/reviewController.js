const Review = require('../models/reviewModel');
const { deleteOne, updateOne, getAll } = require('./handlerFactory');

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
  req.filter = {};
  if (req.params.id) {
    req.filter.tour = req.params.id;
  }
  next();
};

exports.createReview = async (req, res, next) => {
  const reviewData = {
    ...req.body, // rating, review content
  };

  if (req.params.id) {
    reviewData['tour'] = req.params.id; // tourid
  }

  reviewData['user'] = req.user._id; // userid
  const review = await Review.create(reviewData);
  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
};

exports.getAllReviews = getAll(Review);
exports.updateReview = updateOne(Review);
exports.deleteRevew = deleteOne(Review);
