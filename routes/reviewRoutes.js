const express = require("express");
const reviewController = require("../controllers/reviewController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router({
  mergeParams: true
});

router
  .route("/")
  .post(protect, authorize("user", "admin"), reviewController.createReview)
  .get(protect, reviewController.getAllReviews);


// http://localhost:8000/api/v1/tours/hadkjjb3j4bkj4bkj4k3/reviews
// tourid -> req.params
// userid -> req.user

module.exports = router;
