const AppError = require('../utils/appError');
// Development environment -> Send entire error details back in the response
// Production environment ->
//  i) If the error is a Operational error(Invalid Id passed, invalid request body, token expired, invalid token etc)
//     Then we need to send a meaningfull error back in the response
//  ii)If the error is a non operational error (unknown error), we will not expose error details to the client and send a generic
//     error message back in the response.

// This error occurs when we pass an invalid value for ObjectID
const handleCastError = (error) => {
  return new AppError(`Invalid value ${error.value} for ${error.path}`, 400);
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
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode ?? 500;
  error.status = error.status ?? 'error';
  error.message = error.message ?? 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let customError;
    if (error.name === 'CastError') {
      customError = handleCastError(error);
    }
    sendErrorProd(customError, res);
  }
};
