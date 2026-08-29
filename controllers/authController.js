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
  // Check if user has provided an email as part of request body
  const { email } = req.body;
  if (!email) return next(new AppError('Email is required', 400));
  // Check if there is a matching user in the database
  const existingUser = await User.findOne({ email });
  if (!existingUser) return next(new AppError('User does not exist', 404));

  // Generate password reset token
  const passwordResetToken = existingUser.generateAndSavePasswordResetToken();
  await existingUser.save({ validateBeforeSave: false }); // Without validateBeforeSave mongoose will trigger validation and since the document doesn't have passwordConfirm, mongoose will throw Validation Error

  // Generate reset password link that will be send in the email body
  // http://localhost:9000/api/v1/auth/reset-password/:passwordResetToken
  const resetPasswordLink = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${passwordResetToken}`;

  try {
    await sendEmail({
      email,
      subject: 'Your Password Reset Token (Valid for 10 minutes)',
      text: `Please send a PATCH request to the URL: ${resetPasswordLink} along with your new password and confirm password. If you have not requested for a password reset, please ignore this email.`,
    });
    res.status(200).json({
      status: 'sucess',
      data: {
        message: 'Email was sent successfully. Please check you mailbox',
      },
    });
  } catch (error) {
    existingUser.passwordResetToken = undefined;
    existingUser.passwordResetTokenExpiresAt = undefined;
    await existingUser.save({ validateBeforeSave: false }); // Without validateBeforeSave mongoose will trigger validation and since the document doesn't have passwordConfirm, mongoose will throw Validation Error
    next(new AppError('Failed to send email. Please try again.', 500));
  }
};

exports.resetPassword = async (req, res, next) => {
  const passwordResetToken = req.params.token;
  const { newPassword, newPasswordConfirm } = req.body || {};

  // Check if password reset token or new Password or new password confirm is missing
  if (!passwordResetToken || !newPassword || !newPasswordConfirm) {
    return next(new AppError('Password reset token and/or new password and/or confirm new password is missing', 400));
  }

  // Hash the password reset token received in the url
  const hashedPasswordResetToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex');
  // Find a matching user in the database whose reset token matches with the reset token received in the url and which is not expired yet
  const existingUser = await User.findOne({
    passwordResetToken: hashedPasswordResetToken,
    passwordResetTokenExpiresAt: {
      $gt: Date.now(),
    },
  });
  if (!existingUser) {
    return next(new AppError('Reset token is invalid or has expired', 400));
  }
  existingUser.password = newPassword;
  existingUser.passwordConfirm = newPasswordConfirm;
  existingUser.passwordResetToken = undefined;
  existingUser.passwordResetTokenExpiresAt = undefined;
  await existingUser.save();

  const accessToken = existingUser.generateAccessToken();
  res.status(200).json({
    status: 'success',
    data: {
      accessToken,
    },
  });
};

exports.updateMyPassword = async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body || {};
  // Check if user has provided current password, new password and new password confirm
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(new AppError('Please provide current password, new password and confirm new password', 400));
  }

  // Check if the current password is correct
  const isPasswordMatch = await req.user.verifyPassword(currentPassword);
  if (!isPasswordMatch) {
    return next(new AppError('Your current password is not correct. Please provide correct password.', 401));
  }
  // Update the document with new password and new password confirm, then save it to the database
  req.user.password = newPassword;
  req.user.passwordConfirm = newPasswordConfirm;
  await req.user.save();

  // Generate new access token as old one will no longer be valid since user changed password
  const newAccessToken = req.user.generateAccessToken();
  res.status(200).json({
    status: 'success',
    data: {
      accessToken: newAccessToken,
    },
  });
};
