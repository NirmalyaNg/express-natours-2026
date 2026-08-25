const AppError = require("../utils/appError");

module.exports = (...roles) => {
  return (req, res, next) => {
    // We need to check if the logged-in users role matches with any of the roles
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Action not allowed", 403));
    }
    next();
  };
};
