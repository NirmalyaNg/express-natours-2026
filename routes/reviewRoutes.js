const express = require('express');
const reviewController = require('../controllers/reviewController');
const protect = require('../middlewares/protect');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.route('/').get(reviewController.getAllReviews).post(protect, authorize('user'), reviewController.createReview);

module.exports = router;
