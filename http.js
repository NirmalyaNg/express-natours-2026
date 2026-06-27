const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/test1') {
    if (req.method === 'GET') {
      res.writeHead(200, {
        'content-type': 'text/plain',
      });
      res.end('GET request successfull');
    } else if (req.method === 'POST') {
      res.writeHead(201, {
        'content-type': 'text/plain',
      });
      res.end('POST request successfull');
    }
  } else if (req.url === '/test2') {
    if (req.method === 'GET') {
      res.writeHead(200, {
        'content-type': 'text/plain',
      });
      res.end('GET request successfull');
    }
  } else if (req.url === '/') {
    res.writeHead(200, {
      'content-type': 'application/json',
    });
    res.end(
      JSON.stringify({
        message: 'Hello from Server',
      }),
    );
  }
});
const port = 8000;

server.listen(8000, () => {
  console.log(`Server is up and running on port: ${port}`);
});
