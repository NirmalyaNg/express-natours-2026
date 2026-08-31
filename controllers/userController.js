const User = require('../models/userModel');
const { updateOne, deleteOne, getOne, getAll } = require('./handlerFactory');

// Get all users
exports.getAllUsers = getAll(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    error: 'Method not implemented',
  });
};

// Get an user
exports.getUser = getOne(User);
// Update an user
exports.updateUser = updateOne(User);
// Delete an user
exports.deleteUser = deleteOne(User);
