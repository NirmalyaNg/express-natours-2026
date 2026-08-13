const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorMiddleware = require('./middlewares/globalError');
const AppError = require('./utils/appError');

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

// Catch all unhandled routes
app.all('/*splat', (req, res, next) => {
  // throw new Error(`Cannot find ${req.originalUrl} on the server`);
  // const error = new Error(`Cannot find ${req.originalUrl} on the server`);
  // error.statusCode = 404;
  next(new AppError(`Cannot find ${req.originalUrl} on the server`, 404));
});

// This is a global error handling middleware. It will be called whenever next() is called with an argument or an error is thrown in any of the routes or middlewares.
app.use(globalErrorMiddleware);

module.exports = app;
