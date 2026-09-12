const Review = require("../models/reviewModel");

exports.createReview = async (req, res, next) => {
  const reviewData = {
    ...req.body,
  };

  if(req.params.id) {
    reviewData['tour'] = req.params.id; // tourid
  }
  if(req.user._id) {
    reviewData['user'] = req.user._id; // userid
  }
  const review = await Review.create(reviewData);
  res.status(201).json({
    status: "success",
    data: {
      review,
    },
  });
  res.send('Hello');
};

exports.getAllReviews = async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
};
