const AppError = require('../utils/appError');
// Development environment -> Send entire error details back in the response
// Production environment ->
//  i) If the error is a Operational error(Invalid Id passed, invalid request body, token expired, invalid token etc)
//     Then we need to send a meaningfull error back in the response
//  ii)If the error is a non operational error (unknown error), we will not expose error details to the client and send a generic
//     error message back in the response.

// This error occurs when we pass an invalid value for _id field
const handleCastError = (error) => {
  return new AppError(`Invalid value '${error.value}' for '${error.path}'`, 400);
};

// This error occurs when we there is a validation error
const handleValidationError = (error) => {
  let message = 'Validation failed. Errors: ';

  // ['priceDiscount', 'difficulty'] -> [ 'Discount price should be below regular price', 'Difficulty is either: easy, medium, difficult' ] -> 'Discount price should be below regular price. Difficulty is either: easy, medium, difficult'

  message += Object.keys(error.errors)
    .map((key) => error.errors[key].message)
    .join('. ');
  return new AppError(message, 400);
};

// Handle Duplicate key error
const handleDuplicateKeyError = (error, res) => {
  const [key, value] = Object.entries(error.keyValue)[0];
  return new AppError(`Duplicate value '${value}' for key '${key}'`, 400);
};

const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error,
  });
};

const sendErrorProd = (error, res) => {
  // Error objects creating using AppError class will always have isOperational attribute as true
  // Examples of operational errors: CastError, ValidationError, DuplicateKeyError, JWtExpired etc
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    // Non operation/Non-standard errors or programming errors
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode ?? 500;
  error.status = error.status ?? 'error';
  error.message = error.message ?? 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let customError = {
      statusCode: error.statusCode,
      status: error.status,
      message: error.message,
      stack: error.stack,
    };

    if (error.name === 'CastError') {
      customError = handleCastError(error);
    }
    if (error.name === 'ValidationError') {
      customError = handleValidationError(error);
    }
    if (error.code === 11000) {
      customError = handleDuplicateKeyError(error);
    }
    sendErrorProd(customError, res);
  }
};
