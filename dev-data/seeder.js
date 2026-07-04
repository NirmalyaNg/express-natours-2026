const connectDB = require('../config/db');
const Tour = require('../models/tourModel');
const tours = require('./data/tours-simple.json');

// Upload Tours
async function uploadTours() {
  try {
    await Tour.create(tours);
    console.log('Tours created successfully');
  } catch (error) {
    console.log('Failed to upload tours data. Error: ', error);
  }
  process.exit(1);
}

// Delete Tours
async function deleteTours() {
  try {
    await Tour.deleteMany();
    console.log('Tours deleted successfully');
  } catch (error) {
    console.log('Failed to delete tours data. Error: ', error);
  }
  process.exit(1);
}

const operation = process.argv[2];

connectDB()
  .then(() => {
    if (operation === '--upload') {
      uploadTours();
    } else if (operation === '--delete') {
      deleteTours();
    }
  })
  .catch((error) => {
    console.log('Error connecting to database. Error: ', error);
    process.exit(1);
  });
