const app = require('./app');
const connectDB = require('./config/db');

const port = 8000;

// Connect database

connectDB().then((conn) => {
  console.log('Connected to database. Host:', conn.connection.host);
});
// .catch((error) => {
//   console.log('Failed to connect to database. Error: ', error);
//   process.exit(1);
// });

const server = app.listen(port, () => {
  console.log(`Server is up and running on port: ${port}`);
});

// Unhandled rejection
process.on('unhandledRejection', (error) => {
  console.log('UNHANDLED REJECTION! Shutting down..');
  console.log(error.name, error.message);

  server.close(() => {
    process.exit(1);
  });
});
