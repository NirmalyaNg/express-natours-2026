const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Review content is required"],
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
    ref: "User",
  },
  // Parent referencing
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tour",
  },
});

reviewSchema.pre(/^find/, function () {
  this.populate("user").populate({
    path: "tour",
    select: "name",
  });
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
