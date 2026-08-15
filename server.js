// Whenever there is any uncaught exception in our application outside of any express middleware/route handler,
// the error will be caught here
// In such cases, we will log the error and terminate the node process
// Uncaught exception is for synchronous code
process.on('uncaughtException', (error) => {
  console.log(`Uncaught exception: ${error.name} ${error.message}`);
  process.exit(1);
});

const app = require('./app');
require('./config/db');

const port = 8000;

// Connect database

const server = app.listen(port, () => {
  console.log(`Server is up and running on port: ${port}`);
});

// Whenever there is any unhandled promise rejection in our application outside of any express middleware/route handler,
// the error will be caught here
// In such cases, we will first close the server and then once the server is closed, we will log the error and terminate the node process
// Unhandled rejection is for async code(promises)
process.on('unhandledRejection', (error) => {
  server.close(() => {
    console.log(`Unhandled rejection: ${error.name} ${error.message}`);
    process.exit(1);
  });
});
