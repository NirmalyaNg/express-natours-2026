class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Here message is attribute of parent class
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.statusCode = statusCode; // Here status and statusCode are attributes of child class
    this.isOperational = true;
    // Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
