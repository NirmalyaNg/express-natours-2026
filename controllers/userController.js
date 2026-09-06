const path = require("node:path");
const multer = require("multer");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const {
  updateOne,
  deleteOne,
  getOne,
  getAll,
  createOne,
} = require("./handlerFactory");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, "../public/img/users");
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    console.log(file);
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Only images can be uploaded", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadUserPhoto = upload.single("photo");

function filterObj(obj, allowedAttrs) {
  const filteredObj = {};
  allowedAttrs.forEach((attr) => {
    if (attr in obj) {
      filteredObj[attr] = obj[attr];
    }
  });
  return filteredObj;
}

exports.updateMe = async (req, res, next) => {
  const { password, passwordConfirm } = req.body || {};
  if (password || passwordConfirm) {
    return next(
      new AppError(
        "This route is not for updating password. Please use /updateMyPassword for password change.",
        400,
      ),
    );
  }
  const filteredData = filterObj(req.body, ["name", "email"]);
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredData, {
    runValidators: true,
    returnDocument: "after",
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
};

exports.deleteMe = async (req, res) => {
  req.user.active = false;
  await req.user.save({ validateBeforeSave: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
};

// Get all users
exports.getAllUsers = getAll(User);
// Create an user
exports.createUser = createOne(User);
// Get an user
exports.getUser = getOne(User);
// Update an user
exports.updateUser = updateOne(User);
// Delete an user
exports.deleteUser = deleteOne(User);
