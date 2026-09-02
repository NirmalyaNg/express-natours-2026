const { rateLimit } = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const helmet = require('helmet');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorMiddleware = require('./middlewares/globalError');
const AppError = require('./utils/appError');
const app = express();

// Limit request body to 10 Kilobytes
app.use(express.json({ limit: '10Kb' })); // Here express.json is not a middleware. The function which it returns is the middleware

// Prevent cross site scripting attacks
// Express 4.x and 5.x middleware which sanitizes user input data (in req.body, req.query, req.headers and req.params) to prevent Cross Site Scripting (XSS) attack.
app.use(
  xss({
    allowedTags: [],
  }),
);
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

// To trigger uncaught exception
// console.log(x + y);

// To trigger unhandled rejection
// new Promise((resolve, reject) => {
//   setTimeout(() => {
//     reject(new Error('Custom error'))
//   }, 5000);
// })

// Configure a rate limiter middleware

const limiter = rateLimit({
  limit: 100, // Number of requests to allow
  windowMs: 10 * 60 * 1000, // Time frame
  message: 'Too many requests. Please try again later.', // Once the ip is rate limited, it will receive this message from the server with 429 status code
});
app.use(limiter); // Apply the rate limiting middleware here to all requests

/*
Example of nosql query injection -> This will fetch any user whose password is 1234567
{
    "email": {
        "$gt": ""
    },
    "password": "1234567"
    }
    */

// 1. Fix Express 5 query getter issue by making it writable
// This is needed since express 5 doesn't allow modification of req.query as it is read-only.
// So we need to define below middleware so that express-mongo-sanitize can sanitize the req query.
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
// This module searches for any keys in objects that begin with a $ sign or contain a ., from req.body, req.query or req.params. It can then either:
// completely remove these keys and associated data from the object, or
// replace the prohibited characters with another allowed character.
app.use(mongoSanitize());

// Set security response headers
app.use(helmet());

// To extend the behavior of express query parser
app.set('query parser', 'extended');

// To support incoming cookies
app.use(cookieParser());

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
