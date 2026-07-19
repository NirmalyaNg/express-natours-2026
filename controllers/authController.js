const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt } = req.body || {};
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
  });
  const token = newUser.generateJWT();
  const { password: _, ...userWithoutPassword } = newUser.toObject();

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: userWithoutPassword,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body || {};
  // If email or password is missing
  if (!email || !password) {
    return next(new AppError('Email and/or password is missing', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  // Check if email or password is incorrect
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = user.generateJWT();
  res.status(200).json({
    status: 'success',
    token,
  });
});
