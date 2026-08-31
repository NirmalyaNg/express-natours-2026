const AppError = require('../utils/appError');
const User = require('../models/userModel');

// { username: 'hbwdhbwe', email: 'dvffff', role: 'sdfd' } -> obj
// allowedAttributes = ['email', 'username']
// { username: 'ddfdfdfd', email: 'dfdfdf' } -> output
function filterObj(obj, allowedAttributes) {
  let filteredObj = {};

  allowedAttributes.forEach((attr) => {
    if (attr in obj) {
      filteredObj[attr] = obj[attr];
    }
  });
  return filteredObj;
}

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
};

exports.getUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError(`User with id ${req.params.id} not found`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    error: 'Method not implemented',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    error: 'Method not implemented',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    error: 'Method not implemented',
  });
};

exports.updateMe = async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update. Please use /updateMyPassword.', 400));
  }
  // We need to filter out the data that we wish to allow the user to update so that the user cannot update properties like role
  const filteredData = filterObj(req.body, ['username', 'email']);
  // pre('save') middlewares will not be triggered and inside custom validators 'this' will not refer to the document
  // We already have the logged in user's data inside req object from the protect middleware
  // Without runValidators: true, mongoose validations will be skipped
  // Without returnDocument: 'after', mongoose will not return the updated document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredData, {
    runValidators: true,
    returnDocument: 'after',
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
};

exports.deleteMe = async (req, res, next) => {
  req.user.active = false; // Here we are setting the active property of the logged in user to false (soft delete)
  await req.user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: 'sucess',
    data: null,
  });
};
