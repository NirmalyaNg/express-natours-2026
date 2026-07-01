const mongoose = require('mongoose');

function connectDB() {
  return mongoose.connect(process.env.MONGODB_URL);
}

module.exports = connectDB;
