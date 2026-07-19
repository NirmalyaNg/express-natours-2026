const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

exports.protect = catchAsync(async (req, res, next) => {
  // Get the token from headers
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split('Bearer ')[1];
  }
  // Check if token exists
  if (!token) {
    return next(new AppError('Unauthorized. Please login.', 401));
  }
  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // Check if user exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User is no longer found', 401));
  }
  // Check if user has changed password
  const passwordChanged = user.checkIfPasswordChanged(decoded.iat);
  if (passwordChanged) {
    return next(new AppError('User has changed password. Please login again', 401));
  }
  req.user = user;
  next();
});
