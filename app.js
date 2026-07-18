const express = require('express');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');

// Uncaught exception
process.on('uncaughtException', (error) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down..');
  console.log(error.name, error.message);
  process.exit(1);
});

const app = express();

// To extend the behavior of express query parser
app.set('query parser', 'extended');

// Middlewares
app.use(express.json()); // Here express.json is not a middleware. The function which it returns is the middleware

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`)); // To expose static assets inside public folder

app.use((req, res, next) => {
  console.log('Hello from logger Middleware!!');
  next();
});

app.use((req, res, next) => {
  console.log('Hello from requestTime middleware!!');
  req.requestTime = new Date().toISOString();
  next();
});

// Routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handle invalid routes
app.all('*splat', (req, res, next) => {
  const appError = new AppError(`Cannot access ${req.originalUrl} on the server`, 404);
  next(appError);
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
