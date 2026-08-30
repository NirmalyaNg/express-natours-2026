require('../config/db');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const tours = require('./data/tours.json');

async function deleteTours() {
  try {
    const result = await Tour.deleteMany();
    console.log(`${result.deletedCount} tours deleted successfully.`);
    process.exit(0);
  } catch (error) {
    console.log('Failed to delete tours. Error:', error);
    process.exit(1);
  }
}

async function createTours() {
  try {
    const results = await Tour.create(tours);
    console.log(`Inserted ${results.length} tours`);
    process.exit(0);
  } catch (error) {
    console.log('Failed to insert tours. Error:', error);
    process.exit(1);
  }
}

if (process.argv[2] === '--delete') {
  deleteTours();
} else if (process.argv[2] === '--insert') {
  createTours();
}
