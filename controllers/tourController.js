const fs = require('node:fs');
const Tour = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

exports.getAllTours = catchAsync(async (req, res, next) => {
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
});

exports.getTourStats = catchAsync(async (req, res, next) => {
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
});

exports.getMonthlyTourPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  if (!year) {
    return next(new AppError('Year is required!', 400));
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
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tourId = req.params.id;
  const tour = await Tour.findById(tourId);
  if (!tour) {
    return next(new AppError(`Tour not found!`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // const tour = new Tour(req.body);
  // await tour.save();
  const tour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
  });
};

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tourId = req.params.id;
  const tour = await Tour.findByIdAndDelete(tourId);
  if (!tour) {
    return next(new AppError(`Tour not found!`, 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
