const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: String,
    password: {
      type: String,
      select: false,
      required: [true, 'Password is required'],
      minlength: [8, 'Password should have atleast 8 characters'],
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (value) {
          return this.password === value;
        },
        message: 'Passwords do not match',
      },
    },
    passwordChangedAt: Date,
  },
  { timestamps: true },
);

// Hash plain text password
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  this.passwordConfirm = undefined;
});

// Generate JWT for user
userSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// Check if passwords match
userSchema.methods.checkPassword = async function (plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Check if user changed password after token was issued
userSchema.methods.checkIfPasswordChanged = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const passwordChangedAtSecs = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return passwordChangedAtSecs > jwtIssuedAt;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
