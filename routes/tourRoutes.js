const { Router } = require('express');
const tourController = require('../controllers/tourController');

const router = Router();

router.route('/').get(tourController.getAllTours).post(tourController.createTour);

router.get('/top-5-cheap', tourController.aliasTop5Cheap, tourController.getAllTours);

router.get('/tour-stats', tourController.getTourStats);

router.get('/monthly-tour-plan/:year', tourController.getMonthlyTourPlan);

router.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour);

module.exports = router;
