class ApiFeatures {
  // We need a db query and a queryParamsObj
  constructor(dbQuery, queryParamsObj) {
    this.dbQuery = dbQuery;
    this.queryParamsObj = queryParamsObj;
  }

  sort() {
    if (this.queryParamsObj.sort) {
      // Mongoose accepts sort('field1 field2') for multiple fields and not sort('field1,field2')
      // However user will send in the format field1,field2 as part of query param string
      // -price,-ratingsAverage after splitting by , becomes ['-price','-ratingsAverage'] join with space becomes '-price -ratingsAverage'
      const sortBy = this.queryParamsObj.sort.split(',').join(' ');
      this.dbQuery = this.dbQuery.sort(sortBy);
    } else {
      this.dbQuery = this.dbQuery.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = this.queryParamsObj.page ? Number(this.queryParamsObj.page) : 1; // By default page is 1 if user has not sent
    const limit = this.queryParamsObj.limit ? Number(this.queryParamsObj.limit) : 5;

    const skip = (page - 1) * limit;
    this.dbQuery = this.dbQuery.limit(limit).skip(skip);
    return this;
  }

  filter() {
    const queryObj = { ...this.queryParamsObj };

    const excludedFields = ['sort', 'page', 'limit', 'fields']; // These will not be considered for filtering
    excludedFields.forEach((field) => {
      delete queryObj[field];
    });

    let queryObjStr = JSON.stringify(queryObj);

    // \b => for matching exact words -> lt, lte, gt, gte not words which has them in middle
    // g -> for global replace (all occurences)
    queryObjStr = queryObjStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => '$' + match);

    this.dbQuery = this.dbQuery.find(JSON.parse(queryObjStr)); // Here toursQuery stores the db query
    return this;
  }

  limitFields() {
    if (this.queryParamsObj.fields) {
      // Mongoose accepts select = 'field1 field2' for multiple fields and not 'field1,field2'
      // However user will send in the format field1,field2 as part of query param string
      // field1,field2 after splitting by , becomes ['field1','field2'] join with space becomes 'field1,field2'
      const fields = this.queryParamsObj.fields.split(',').join(' ');
      this.dbQuery = this.dbQuery.select(fields);
    } else {
      this.dbQuery = this.dbQuery.select('-__v'); // By default we will not send the __v attribute for each tour
    }
    return this;
  }
}

module.exports = ApiFeatures;
