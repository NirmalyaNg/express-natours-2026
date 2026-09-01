require('../config/db');

const Tour = require('../models/tourModel');
const User = require('../models/userModel');

const tours = require('../dev-data/data/tours.json');
``;

async function deleteData() {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    console.log('Data deleted successfully');
  } catch (error) {
    console.log('Error deleting data:', error);
  }
  process.exit();
}

async function importData() {
  try {
    await Tour.create(tours);
    console.log('Data inserted successfully');
  } catch (error) {
    console.log('Error inserting data:', error);
  }
  process.exit();
}

if (process.argv[2] === '--delete') {
  deleteData();
} else if (process.argv[2] === '--import') {
  importData();
}
