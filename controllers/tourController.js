const fs = require('node:fs');
const path = require('node:path');
const pathToFile = path.join(__dirname, '../dev-data/data/tours-simple.json');

const tours = JSON.parse(fs.readFileSync(pathToFile, 'utf-8')); // Data will be read from json file as string, so we need to parse the data into js array

exports.getAllTours = (req, res) => {
  return res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id; // All route params are strings
  const tour = tours.find((tour) => tour.id === +id);
  console.log('RequestTime: ', req.requestTime);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      error: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newTour = {
    id: tours.length,
    ...req.body,
  };
  tours.push(newTour);
  fs.writeFile(pathToFile, JSON.stringify(tours), 'utf-8', (error) => {
    if (error) {
      return res.status(500).json({
        status: 'error',
        error: error.message,
      });
    }
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).send();
};
