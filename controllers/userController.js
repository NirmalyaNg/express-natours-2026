const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    error: 'Method not implemented',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    error: 'Method not implemented',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    error: 'Method not implemented',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // Check if user is trying to update password
  if (req.body?.password || req.body?.passwordConfirm) {
    return next(new AppError('You cannot update your password through this route. Please use /changeMyPassword', 400));
  }
  const allowedUpdates = ['name', 'email'];
  const updates = {};
  allowedUpdates.forEach((update) => {
    if (req.body?.[update]) {
      updates[update] = req.body[update];
    }
  });
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    runVlidators: true,
    returnDocument: 'after',
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  req.user.active = false;
  await req.user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
