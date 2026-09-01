const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review is required'],
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
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to an user'],
  },
});

reviewSchema.statics.updateTourReviewStats = async function (tourId) {
  const reviewStats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour',
        numRatings: {
          $sum: 1,
        },
        averageRating: {
          $avg: '$rating',
        },
      },
    },
  ]);
  if (reviewStats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: reviewStats[0].averageRating,
      ratingsQuantity: reviewStats[0].numRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// Update the ratingsAverage and ratingsQuantity on a tour when its review is created/updated/deleted
reviewSchema.post('save', function (doc) {
  const tourId = doc.tour;
  doc.model().updateTourReviewStats(tourId);
});

reviewSchema.pre(/^findOneAnd/, async function () {
  const r = await this.model.findOne(this.getQuery());
  this.r = r;
});

reviewSchema.post(/^findOneAnd/, async function () {
  this.model.updateTourReviewStats(this.r.tour._id);
});

// Populate user and tour for review
reviewSchema.pre(/^find/, function () {
  this.populate('user').populate({ path: 'tour', select: 'name' });
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
