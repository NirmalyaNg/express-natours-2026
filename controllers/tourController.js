const fs = require('node:fs');
const path = require('node:path');
const Tour = require('../models/tourModel');
const pathToFile = path.join(__dirname, '../dev-data/data/tours-simple.json');

const tours = JSON.parse(fs.readFileSync(pathToFile, 'utf-8')); // Data will be read from json file as string, so we need to parse the data into js array

exports.getAllTours = async (req, res) => {
  try {
    // Filter

    // { difficulty: 'easy', price[gte]: 1197 } - with query parser -> default
    // { difficulty: 'easy', price: { lt: '1197' } } - with query parser -> extended

    // Option 1: Static
    // const tours = await Tour.find().where('difficulty').equals('easy').where('price').lt(1500);

    // Option 2: Static
    // const tours = await Tour.find({
    //   difficulty: 'easy',
    //   price: {
    //     $gt: 1500,
    //     $lt: 2000
    //   },
    // });
    const queryObj = { ...req.query };

    const excludedFields = ['sort', 'page', 'limit', 'fields']; // These will not be considered for filtering
    excludedFields.forEach((field) => {
      delete queryObj[field];
    });

    let queryObjStr = JSON.stringify(queryObj);

    // \b => for matching exact words -> lt, lte, gt, gte not words which has them in middle
    // g -> for global replace (all occurences)
    queryObjStr = queryObjStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => '$' + match);

    let toursQuery = Tour.find(JSON.parse(queryObjStr)); // Here toursQuery stores the db query

    // Sort
    if (req.query.sort) {
      // Mongoose accepts sort = 'field1 field2' for multiple fields and not 'field1,field2'
      // However user will send in the format field1,field2 as part of query param string
      // -price,-ratingsAverage after splitting by , becomes ['-price','-ratingsAverage'] join with space becomes '-price -ratingsAverage'
      const sortBy = req.query.sort.split(',').join(' ');
      toursQuery = toursQuery.sort(sortBy);
    } else {
      toursQuery = toursQuery.sort('-createdAt');
    }

    // Fields
    if (req.query.fields) {
      // Mongoose accepts select = 'field1 field2' for multiple fields and not 'field1,field2'
      // However user will send in the format field1,field2 as part of query param string
      // field1,field2 after splitting by , becomes ['field1','field2'] join with space becomes 'field1,field2'
      const fields = req.query.fields.split(',').join(' ');
      toursQuery = toursQuery.select(fields);
    } else {
      toursQuery = toursQuery.select('-__v'); // By default we will not send the __v attribute for each tour
    }

    // Pagination
    const page = req.query.page ? Number(req.query.page) : 1; // By default page is 1 if user has not sent
    const limit = req.query.limit ? Number(req.query.limit) : 3;

    const skip = (page - 1) * limit;
    toursQuery = toursQuery.limit(limit).skip(skip);

    const tours = await toursQuery; // Here the query is sent to db

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
