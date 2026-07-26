const crypto = require('node:crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/sendEmail');

const generateAndSendToken = (user, statusCode, res, includeUser = false) => {
  const token = user.generateJWT();
  const { password: _, ...userWithoutPassword } = user.toObject();
  res.status(statusCode).json({
    status: 'success',
    token,
    ...(includeUser ? { user: userWithoutPassword } : {}),
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt } = req.body || {};
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });
  // Generate new token and send response
  generateAndSendToken(newUser, 201, res, true);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body || {};
  // If email or password is missing
  if (!email || !password) {
    return next(new AppError('Email and/or password is missing', 400));
  }
  const user = await User.findOne({ email });
  // Check if email or password is incorrect
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // Generate new token and send response
  generateAndSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Check for email in request body
  if (!req.body?.email) return next(new AppError('Email is required', 400));

  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('User does not exist', 404));

  // Generate password reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false }); // Since there will be no confirmPassword
  const resetPasswordUrl = `${req.protocol}://${req.get('host')}/api/v1/reset-password/${resetToken}`;

  // Send Email
  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Password Reset Token (Valid for 10 minutes)',
      message: `Forgot your password? Send a PATCH request to ${resetPasswordUrl} to reset your password. If you didn't request for a password reset, please ignore.`,
    });
    res.status(200).json({
      status: 'success',
      data: 'Email sent',
    });
  } catch (error) {
    // If there is an error in sending email, remove passwordResetToken and passwordResetTokenExpiresAt from DB
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();
    return next(new AppError('Email could not be sent. Please try again.', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Check for reset token
  const resetToken = req.params.resetToken;
  const { password, passwordConfirm } = req.body || {};
  if (!resetToken) return next(new AppError('No reset token provided', 400));
  if (!password || !passwordConfirm) return next(new AppError('Both password and confirm password are required', 400));

  const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Find user who has a matching hashed reset token and check if reset token has not been expired
  const user = await User.findOne({
    passwordResetToken: hashedResetToken,
    passwordResetTokenExpiresAt: {
      $gt: new Date().getTime(),
    },
  });
  if (!user) return next(new AppError('Invalid reset token or token has expired', 400));
  // Update the user
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  // Save user
  await user.save();
  // Generate new token and send response
  generateAndSendToken(user, 200, res);
});

exports.changeMyPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { currentPassword, newPassword, newPasswordConfirm } = req.body || {};
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(new AppError('Current password, new password and confirm new password are required', 400));
  }

  // Check if current password is correct
  if (!(await user.checkPassword(currentPassword, user.password))) {
    return next(new AppError('Current password is not correct.', 400));
  }
  // Update new password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  // Save updated user document
  await user.save();
  // Generate new token and send response
  generateAndSendToken(user, 200, res);
});
