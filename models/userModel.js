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
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.passwordChangedAt;
        delete ret.passwordResetToken;
        delete ret.passwordResetTokenExpiresAt;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Hash plain text password
userSchema.pre('save', async function () {
  // isModified('password') will return true at first during registration as well as later on when the password has changed
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.passwordConfirm = undefined; // This attribute will not be saved in the database
});

userSchema.pre('save', function () {
  // This will make sure that the code below runs only when password has been modifed and the document is not being saved to the db for the first time
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 2000; // To ensure password has changed before token got generated
  }
});

// Instance method -> This method will be accesible to all the user documents
userSchema.methods.verifyPassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Instance method to generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: 15 * 60, // 15 minutes in seconds
  });
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  });
};

// Generate password reset token, hash it and save it in the document
userSchema.methods.generateAndSavePasswordResetToken = function () {
  const passwordResetToken = crypto.randomBytes(32).toString('hex');
  const hashedPasswordResetToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex');

  this.passwordResetToken = hashedPasswordResetToken;
  this.passwordResetTokenExpiresAt = new Date().getTime() + 10 * 60 * 1000; // 10 minutes after the token is generated
  return passwordResetToken;
};

// Check if user has changed password after the token was geenrated
userSchema.methods.passwordChangedAfter = function (tokenIssuedAtMs) {
  if (this.passwordChangedAt) {
    const passwordChangedAtMs = this.passwordChangedAt.getTime();
    if (passwordChangedAtMs > tokenIssuedAtMs) {
      return true;
    }
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
