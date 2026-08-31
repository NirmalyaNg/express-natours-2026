const fs = require('node:fs');
const Tour = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const { deleteOne, createOne, updateOne, getOne, getAll } = require('./handlerFactory');

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

exports.getTourStats = async (req, res) => {
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
};

exports.getMonthlyTourPlan = async (req, res, next) => {
  const year = req.params.year;
  if (!year) {
    return next(new AppError('Year is required', 400));
  }

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', // Convert attribute having array to single value
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // To group tours using the month of the startDates
        numTourStarts: { $sum: 1 }, // To create a count of all tours starting for that month
        tours: { $push: '$name' }, // To create an array of tour names beloning to that month
      },
    },
    {
      $addFields: {
        month: '$_id', // We will create a new attribute called month for each group and reuse the value of _id
      },
    },
    {
      $project: {
        _id: 0, // By specifying a value of 0, we indicate that we do not want to keep the _id attribute for each group
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
};

// Get all tours
exports.getAllTours = getAll(Tour);
// Get a tour
exports.getTour = getOne(Tour, { path: 'reviews', select: '-tour' });
// Create a tour
exports.createTour = createOne(Tour);
// Update a tour
exports.updateTour = updateOne(Tour);
// Delete a tour
exports.deleteTour = deleteOne(Tour);
