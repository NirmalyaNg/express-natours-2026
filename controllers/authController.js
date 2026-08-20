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

exports.login = async () => {};
