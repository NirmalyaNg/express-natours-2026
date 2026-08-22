const AppError = require("../utils/appError");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;
  const user = await User.create({
    username,
    email,
    password,
    passwordConfirm,
  });

  res.status(201).json({
    status: "sucess",
    data: {
      user,
    },
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Email and/or password was not provided", 400));
  }
  const existingUser = await User.findOne({ email });
  if (!existingUser || !(await existingUser.verifyPassword(password))) {
    return next(new AppError("Invalid credentials", 400));
  }
  const accessToken = existingUser.generateAccessToken();
  const refreshToken = existingUser.generateRefreshToken();

  res.cookie("REFRESH_TOKEN", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "success",
    data: {
      accessToken,
    },
  });
};

// This endpoint is responsible for generating a new accessToken when the existing accessToken is expired
exports.refresh = async (req, res, next) => {
  const refreshToken = req.cookies.REFRESH_TOKEN;
  if (!refreshToken) {
    // Check if the refresh token exists in the cookies
    return next(new AppError("Invalid token", 401));
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); // Verify if the refresh token is valid
    const existingUser = await User.findById(decoded._id);
    if (!existingUser) {
      return next(new AppError("User no longer exists!", 401));
    }
    const newAccessToken = existingUser.generateAccessToken();
    res.status(200).json({
      status: "success",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(new AppError("Invalid token", 401));
  }
};
