const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.signup = async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;
  const user = await User.create({
    username,
    email,
    password,
    passwordConfirm,
  });

  res.status(201).json({
    status: 'sucess',
    data: {
      user,
    },
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Email and/or password was not provided', 400));
  }
  const existingUser = await User.findOne({ email });
  if (!existingUser || !(await existingUser.verifyPassword(password))) {
    return next(new AppError('Invalid credentials', 400));
  }
  const accessToken = existingUser.generateAccessToken();
  const refreshToken = existingUser.generateRefreshToken();

  res.cookie('REFRESH_TOKEN', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    status: 'success',
    data: {
      accessToken,
    },
  });
};
