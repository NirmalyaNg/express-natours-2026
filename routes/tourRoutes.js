const { Router } = require("express");
const tourController = require("../controllers/tourController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = Router();

router
  .route("/")
  .get(tourController.getAllTours)
  .post(protect, authorize("lead-guide", "admin"), tourController.createTour);

router.get(
  "/top-5-cheap",
  tourController.aliasTop5Cheap,
  tourController.getAllTours,
);

router.get("/tour-stats", tourController.getTourStats);

router.get("/monthly-tour-plan/:year", tourController.getMonthlyTourPlan);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(protect, tourController.updateTour)
  .delete(protect, tourController.deleteTour);

module.exports = router;
