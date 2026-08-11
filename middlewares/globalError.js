module.exports = (error, req, res, next) => {
  const statusCode = error.statusCode ?? 500;
  const status = error.status ?? 'error';
  const message = error.message ?? 'Internal Server Error';

  console.log(error.stack);
  res.status(statusCode).json({
    status,
    message,
  });
};
