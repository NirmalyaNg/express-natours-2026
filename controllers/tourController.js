const fs = require('node:fs');
const Tour = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');

exports.aliasTop5Cheap = (req, res, next) => {
  // Since in express 5, req.query object is readonly so we cannot modify it
  // So we need to use definedProperty to set the value of the req.query object and make it writable and configurable
  Object.defineProperty(req, 'query', {
    value: {
      ...req.query,
      sort: '-ratingsAverage,price',
      page: '1',
      limit: '5',
    },
    writable: true,
    configurable: true,
  });
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const features = new ApiFeatures(Tour.find(), req.query);
    // features.filter();
    // features.sort();
    // features.limitFields();
    // features.paginate();

    features.filter().sort().limitFields().paginate(); // This chaining is possible only if each of the four methods return the instance of the object (this)

    const tours = await features.dbQuery; // Here the query is sent to db

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err.message,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      // Filtering stage
      {
        $match: {
          //difficulty: 'easy',
          ratingsAverage: {
            $gt: 4.5,
          },
        },
      },
      // Grouping stage
      {
        $group: {
          _id: null, // Everything is considered in a single group
          numTours: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgRating: { $avg: '$ratingsAverage' },
          totalRatings: { $sum: '$ratingsQuantity' },
        },
      },
      // {
      //   $group: {
      //     _id: {
      //       $toUpper: '$difficulty', // Group by attribute
      //     },
      //     numTours: { $sum: 1 },
      //     avgPrice: { $avg: '$price' },
      //     minPrice: { $min: '$price' },
      //     maxPrice: { $max: '$price' },
      //     avgRating: { $avg: '$ratingsAverage' },
      //     totalRatings: { $sum: '$ratingsQuantity' },
      //   },
      // },
      // Sorting
      {
        $sort: {
          numTours: 1,
          avgRating: -1,
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: err.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tourId = req.params.id;
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        error: 'Tour not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const tour = new Tour(req.body);
    // await tour.save();
    const tour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      error: err,
    });
  }
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
  });
};

exports.deleteTour = async (req, res) => {
  try {
    const tourId = req.params.id;
    const tour = await Tour.findByIdAndDelete(tourId);
    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        error: 'Tour not found',
      });
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err,
    });
  }
};
