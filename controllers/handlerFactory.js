const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

// Get All
exports.getAll = (Model) => {
  return async (req, res) => {
    const features = new ApiFeatures(Model.find(req.filter ?? {}), req.query);
    // features.filter();
    // features.sort();
    // features.limitFields();
    // features.paginate();

    features.filter().sort().limitFields().paginate(); // This chaining is possible only if each of the four methods return the instance of the object (this)

    const docs = await features.dbQuery;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs,
      },
    });
  };
};

exports.deleteOne = (Model) => {
  return async (req, res) => {
    const docId = req.params.id;
    const doc = await Model.findByIdAndDelete(docId);
    if (!doc) {
      return next(new AppError(`Doc with id ${docId} not found!`, 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  };
};

exports.updateOne = (Model) => {
  return async (req, res, next) => {
    const docId = req.params.id;
    const doc = await Model.findById(docId);

    if (!doc) {
      return next(new AppError(`Doc with id ${docId} not found.`, 404));
    }

    Object.keys(req.body).forEach((key) => {
      doc[key] = req.body[key];
    });

    await doc.save();

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  };
};
