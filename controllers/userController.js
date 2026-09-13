const User = require("../models/userModel");
const AppError = require("../utils/appError");
const multer = require('multer');
const sharp = require('sharp');
const {
  updateOne,
  deleteOne,
  getOne,
  getAll,
  createOne,
} = require("./handlerFactory");


function filterObj(obj, allowedAttrs) {
  const filteredObj = {};
  allowedAttrs.forEach((attr) => {
    if (attr in obj) {
      filteredObj[attr] = obj[attr];
    }
  });
  return filteredObj;
}

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if(!file.mimetype.startsWith('image')) {
    cb(new AppError('File is not an image', 400), false);
  } else {
    cb(null, true);
  }
}

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`); 

  next();
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
  if(req.file?.filename) filteredData['photo'] = req.file.filename;

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
