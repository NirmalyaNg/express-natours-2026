const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports = async (req, res, next) => {
  let authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not logged in', 401));
  }
  const token = authHeader.split(' ')[1];
  try {
    // If the token is valid, then jwt.verify will return the payload that was encoded while token creation
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // We are querying the db to check if the user still exists
    const existingUser = await User.findById(decoded._id);
    if (!existingUser) {
      return next(new AppError('User no longer exists', 401));
    }
    // TODO: Check if the user changed password after token was created
    const hasPasswordChanged = existingUser.passwordChangedAfter(decoded.iat * 1000);
    if (hasPasswordChanged) {
      return next(new AppError('User changed password recently. Please login again.', 401));
    }
    req.user = existingUser;
    next();
  } catch (error) {
    console.log(error);
    next(new AppError('Invalid token', 401));
  }
};
