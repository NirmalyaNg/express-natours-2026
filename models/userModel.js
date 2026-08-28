const crypto = require('node:crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      minlength: [3, 'Username must have atleast 3 characters'],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        // validator: function (value) {
        //   return validator.isEmail(value);
        // },
        validator: validator.isEmail,
        message: 'Email is invalid',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      trim: true,
      minlength: [6, 'Password must have atleast 6 characters'],
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Password Confirm is required'],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: 'Passwords do no match',
      },
    },
    role: {
      type: String,
      default: 'user',
      enum: {
        values: ['user', 'guide', 'lead-guide', 'admin'],
        message: "Roles can be: 'user', 'guide', 'lead-guide', 'admin'",
      },
    },
    passwordResetToken: String,
    passwordResetTokenExpiresAt: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true },
);

// Hash plain text password
userSchema.pre('save', async function () {
  // isModified('password') will return true at first during registration as well as later on when the password has changed
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.passwordConfirm = undefined; // This attribute will not be saved in the database
});

// Update passwordChangedAt field if password has been modifed and if the document is not being saved for the first time
userSchema.pre('save', function () {
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 2000; // Subtract 2 secs buffer so that passwordChangedAt is later than token generated timestamp
  }
});

// Instance method -> This method will be accesible to all the user documents
userSchema.methods.verifyPassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Instance method to generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: 15 * 60 * 1000,
  });
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: 7 * 24 * 60 * 60 * 1000,
  });
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const passwordResetToken = crypto.randomBytes(32).toString('hex');
  const hashedPasswordResetToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex');
  this.passwordResetToken = hashedPasswordResetToken;
  this.passwordResetTokenExpiresAt = Date.now() + 10 * 60 * 1000;
  return passwordResetToken;
};

// Check if password was changed after token generation
userSchema.methods.passwordChangedAfter = function (iatMs) {
  if (this.passwordChangedAt) {
    const passwordChangedAtMs = this.passwordChangedAt.getTime();
    console.log('passwordChangedAtMs > iatMs', passwordChangedAtMs > iatMs);
    return passwordChangedAtMs > iatMs;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
