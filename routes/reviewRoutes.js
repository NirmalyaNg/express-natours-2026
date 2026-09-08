const express = require("express");
const reviewController = require("../controllers/reviewController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("user", "admin"), reviewController.createReview)
  .get(protect, reviewController.getAllReviews);

module.exports = router;
