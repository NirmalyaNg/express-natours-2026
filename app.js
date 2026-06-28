const express = require('express');
const tourRouter = require('./routes/tourRoutes');

const app = express();
const port = 8000;

app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from logger Middleware!!');
  next();
});

app.use((req, res, next) => {
  console.log('Hello from requestTime middleware!!');
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);

app.listen(port, () => {
  console.log(`Server is up and running on port: ${port}`);
});
