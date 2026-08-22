const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      minlength: [3, "Username must have atleast 3 characters"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        // validator: function (value) {
        //   return validator.isEmail(value);
        // },
        validator: validator.isEmail,
        message: "Email is invalid",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minlength: [6, "Password must have atleast 6 characters"],
    },
    passwordConfirm: {
      type: String,
      required: [true, "Password Confirm is required"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Passwords do no match",
      },
    },
    role: {
      type: String,
      default: "user",
      enum: {
        values: ["user", "guide", "lead-guide", "admin"],
        message: "Roles can be: 'user', 'guide', 'lead-guide', 'admin'",
      },
    },
  },
  { timestamps: true },
);

// Hash plain text password
userSchema.pre("save", async function () {
  // isModified('password') will return true at first during registration as well as later on when the password has changed
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.passwordConfirm = undefined; // This attribute will not be saved in the database
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

const User = mongoose.model("User", userSchema);

module.exports = User;
