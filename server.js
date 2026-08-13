const app = require('./app');
const connectDB = require('./config/db');

const port = 8000;

// Connect database

connectDB()
  .then((conn) => {
    console.log('Connected to database. Host:', conn.connection.host);
    // Start Server
    app.listen(port, () => {
      console.log(`Server is up and running on port: ${port}`);
    });
  })
  .catch((error) => {
    console.log('Failed to connect to database. Error: ', error);
    process.exit(1);
  });
