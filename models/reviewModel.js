const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review content is required'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  // Parent referencing
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Parent referencing
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
  },
});

reviewSchema.pre(/^find/, function () {
  // this.populate("user").populate({
  //   path: "tour",
  //   select: "name",
  // });
  this.populate('user');
});

// We need to invoke this method on the model, hence we are creating it as a static method
// In case of instance methods, this points to the document
// In case of static methods, this points to the model
reviewSchema.statics.calculateReviewStats = async function (tourId) {
  // We need to run an aggregation on Review model to find out the total ratings and average rating for the tour
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: null,
        nRatings: {
          $sum: 1,
        },
        avgRating: {
          $avg: '$rating',
        },
      },
    },
  ]);

  if (stats.length) {
    await Tour.findByIdAndUpdate(tourId, { ratingsAverage: stats[0].avgRating, ratingsQuantity: stats[0].nRatings });
  } else {
    // Reset to default if there are no reviews
    await Tour.findByIdAndUpdate(tourId, { ratingsAverage: 4.5, ratingsQuantity: 0 });
  }
};

// Applicable for creating review as well as updating review(as we use .save/.create in both)
// Here this refers to the review which was created/updated, so we can get the model using this.model() method
reviewSchema.post('save', async function () {
  const tourId = this.tour;
  this.model().calculateReviewStats(tourId);
});

// findByIdAndDelete internally calls findOneAndDelete, findByIdAndUpdate internally calls findOneAndUpdate
// Since this is a query middleware, this points to the query and we can get the model using this.model attribute
reviewSchema.post(/^findOneAnd/, function (doc) {
  const tourId = doc.tour;
  this.model.calculateReviewStats(tourId);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
