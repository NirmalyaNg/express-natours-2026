require('../config/db');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const tours = require('./data/tours.json');
const users = require('./data/users.json');
const reviews = require('./data/reviews.json');

// Upload Tours
async function uploadData() {
  try {
    await User.create(users, {
      validateBeforeSave: false,
    });
    await Tour.create(tours);
    await Review.create(reviews);
    console.log('Data created successfully');
  } catch (error) {
    console.log('Failed to upload data. Error: ', error);
  }
  process.exit(1);
}

// Delete Tours
async function deleteData() {
  try {
    await User.deleteMany();
    await Tour.deleteMany();
    await Review.deleteMany();
    console.log('Data deleted successfully');
  } catch (error) {
    console.log('Failed to delete data. Error: ', error);
  }
  process.exit(1);
}

const operation = process.argv[2];

if (operation === '--upload') {
  uploadData();
} else if (operation === '--delete') {
  deleteData();
}
