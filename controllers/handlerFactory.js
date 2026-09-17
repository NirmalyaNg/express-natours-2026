const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.create = (Model) => {
  return async (req, res) => {
    // const tour = new Tour(req.body);
    // await tour.save();
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  };
};

exports.getAll = (Model) => {
  return async (req, res) => {
    const features = new ApiFeatures(Model.find(req.filterObj ?? {}), req.query);
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

exports.getOne = (Model, populateOptions) => {
  return async (req, res, next) => {
    const docId = req.params.id;

    let query = Model.findById(docId);

    if (populateOptions?.length) {
      populateOptions.forEach((option) => {
        query = query.populate(option);
      });
    }

    const doc = await query;
    if (!doc) {
      return next(new AppError(`Doc with id ${docId} not found!`, 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  };
};
