const express = require('express');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const { xss } = require('express-xss-sanitizer');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorMiddleware = require('./middlewares/globalError');
const AppError = require('./utils/appError');

const app = express();

// To extend the behavior of express query parser
app.set('query parser', 'extended');

// Global Middlewares
// Parse request body data as json
app.use(
  express.json({
    limit: '10kb',
  }),
); // Here express.json is not a middleware. The function which it returns is the middleware

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'name',
      'duration',
      'maxGroupSize',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'priceDiscount',
    ],
  }),
);

// Prevent xss attack
app.use(xss({ allowedTags: [] }));

// Sanitize data
// Note: express-mongo-sanitize's default middleware tries to reassign req.query,
// which Express 5 disallows (query is a getter-only property). Sanitize body/params
// normally, but sanitize query in place instead of reassigning it.
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  if (req.query) {
    const cleaned = mongoSanitize.sanitize(req.query);
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, cleaned);
  }
  next();
});

// Rate limit
app.use(
  '/api',
  rateLimit({
    limit: 100,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP. Please try again after some time.',
  }),
);

// Set security headers
app.use(helmet());

// Request logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Expose static data
app.use(express.static(`${__dirname}/public`)); // To expose static assets inside public folder

// Custom middleware
app.use((req, res, next) => {
  console.log('Hello from logger Middleware!!');
  next();
});

// Custom middleware
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
