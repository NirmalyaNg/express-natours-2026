const express = require('express');

const app = express();
const port = 8000;

app.get('/test1', (req, res) => {
  res.status(200).send('GET request successfull');
});

app.post('/test1', (req, res) => {
  res.status(201).send('POST request successfull');
});

app.get('/test2', (req, res) => {
  res.status(200).send('GET request successfull');
});

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Server',
  });
});

app.listen(port, () => {
  console.log(`Server is up and running on port: ${port}`);
});
