const Review = require('../models/reviewModel');

exports.getAllReviews = async function (req, res, next) {
  const filter = {};
  if (req.params.tourId) {
    filter['tour'] = req.params.tourId;
  }
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
};

exports.createReview = async function (req, res) {
  if (req.params.tourId) {
    req.body.tour = req.params.tourId;
  }
  if (req.user._id) {
    req.body.user = req.user._id;
  }
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
};
