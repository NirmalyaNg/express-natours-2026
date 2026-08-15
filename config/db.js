const mongoose = require('mongoose');

function connectDB() {
  return mongoose.connect(process.env.MONGODB_URL);
}

connectDB()
  .then((conn) => {
    console.log('Connected to database. Host:', conn.connection.host);
    // Start Server
  })
  .catch((error) => {
    console.log('Failed to connect to database. Error: ', error);
    process.exit(1);
  });
