const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

exports.createOne = (Model) => async (req, res) => {
  const doc = await Model.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
};

exports.updateOne = (Model) => async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    returnDocument: 'after',
  });
  if (!doc) {
    return next(new AppError(`Document with id ${req.params.id} not found.`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
};

exports.deleteOne = (Model) => async (req, res) => {
  const docId = req.params.id;
  const doc = await Model.findByIdAndDelete(docId);
  if (!doc) {
    return next(new AppError(`Document with id ${docId} not found!`, 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

exports.getOne = (Model, popOptions) => async (req, res, next) => {
  const id = req.params.id;
  let query = Model.findById(id);
  if (popOptions) {
    query = query.populate(popOptions);
  }
  const doc = await query;
  if (!doc) {
    return next(new AppError(`Document with id ${id} not found!`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
};

exports.getAll = (Model) => async (req, res) => {
  // req.filterObj is set by route middleware for nested routes (optional)
  const features = new ApiFeatures(Model.find(req.filterObj || {}), req.query);
  // features.filter();
  // features.sort();
  // features.limitFields();
  // features.paginate();

  features.filter().sort().limitFields().paginate(); // This chaining is possible only if each of the four methods return the instance of the object (this)

  const docs = await features.dbQuery.explain(); // Here the query is sent to db

  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: {
      data: docs,
    },
  });
};
