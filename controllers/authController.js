const crypto = require('node:crypto');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

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

// This endpoint is responsible for generating a new accessToken when the existing accessToken is expired
exports.refresh = async (req, res, next) => {
  const refreshToken = req.cookies.REFRESH_TOKEN;
  if (!refreshToken) {
    // Check if the refresh token exists in the cookies
    return next(new AppError('Invalid token', 401));
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); // Verify if the refresh token is valid
    const existingUser = await User.findById(decoded._id);
    if (!existingUser) {
      return next(new AppError('User no longer exists!', 401));
    }
    const newAccessToken = existingUser.generateAccessToken();
    res.status(200).json({
      status: 'success',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body || {};
  // Check if email is provided
  if (!email) return next(new AppError('Email is required', 400));

  // Check if the user exists with matching email
  const existingUser = await User.findOne({ email });
  if (!existingUser) return next(new AppError('User does not exist', 404));

  // Generate password reset token and save user document
  const passwordResetToken = existingUser.generatePasswordResetToken();
  await existingUser.save({ validateBeforeSave: false });

  // Generate reset password link that will be send in the email body
  // http://localhost:9000/api/v1/auth/reset-password/:passwordResetToken
  const passwordResetLink = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${passwordResetToken}`;
  try {
    await sendEmail({
      email,
      subject: 'Your password reset link (Valid for 10 minutes)',
      text: `Forgot your password? Submit a PATCH request to ${passwordResetLink} with your new password and confirm password. If you have not requested for a password reset, please ignore this email.`,
    });
    res.status(200).json({
      status: 'success',
      message: 'Email sent successfully',
    });
  } catch (error) {
    existingUser.passwordResetToken = undefined;
    existingUser.passwordResetTokenExpiresAt = undefined;
    await existingUser.save({ validateBeforeSave: false });
    next(new AppError('Failed to send email. Please try again.', 500));
  }
};

exports.resetPassword = async (req, res, next) => {
  const passwordResetToken = req.params.token;
  const { newPassword, newPasswordConfirm } = req.body || {};
  // Check if password reset token, new password and confirm new passwords are provided
  if (!passwordResetToken || !newPassword || !newPasswordConfirm) {
    return next(new AppError('Please provide password reset token, new password and confirm new password', 400));
  }

  // Check if there is any user in the database with matching password reset token that hasn't expired yet
  const hashedPasswordResetToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex');
  const existingUser = await User.findOne({
    passwordResetToken: hashedPasswordResetToken,
    passwordResetTokenExpiresAt: { $gt: Date.now() },
  });
  if (!existingUser) return next(new AppError('Password reset token is invalid or has expired', 400));

  // Update fields
  existingUser.passwordResetToken = undefined;
  existingUser.passwordResetTokenExpiresAt = undefined;
  existingUser.password = newPassword;
  existingUser.passwordConfirm = newPasswordConfirm;
  // Save updated document
  await existingUser.save();
  // Generate new access token because old one will no longer be valid as user has changed password
  const newAccessToken = existingUser.generateAccessToken();
  res.status(200).json({
    status: 'success',
    data: {
      accessToken: newAccessToken,
    },
  });
};

exports.changePassword = async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body || {};
  // Check if current password, new password and new password confirm is present
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(new AppError('Current Password, new password and confirm password are required', 400));
  }

  // Check if current password matches with logged in user's password
  const passwordsMatch = await req.user.verifyPassword(currentPassword);
  if (!passwordsMatch) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update the password for the user document and save it
  req.user.password = newPassword;
  req.user.passwordConfirm = newPasswordConfirm;
  await req.user.save();

  // Generate new access token
  const newAccessToken = req.user.generateAccessToken();
  res.status(200).json({
    status: 'success',
    data: {
      accessToken: newAccessToken,
    },
  });
};
