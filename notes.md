##Express:

# DAY 1

-> Express is a minimal node.js framework which provides a layer of abstraction.
-> Express has a lot of features such as: complex routing, easier handling of requests and responsees, middleware,
server-side rendering etc.
-> Express helps in faster and easier development with node.js.

In order to create an express application, we need to install express package and then invoke the express function.
Eg:
const express = require('express');
const app = express();

In order to start the server we need to call listen method on express app and pass the port number and an optional
callback function.

For each type of request method such as GET, POST etc express app provides us with associated methods such as .get(), .post() etc.

When we send JSON data back to the client, Express automatically detects it, converts it to a JSON string, and sets the appropriate Content-Type header.

#API:

API stands for Application Programming Interface. It is a piece of software that can be used by another piece of software
in order to allow applications to talk to each other.

Eg:

1. We create APIs that enable communication between the client and the server.
2. Node.js provides the fs module, which includes methods such as readFile(), writeFile(), etc., that allow us to interact with the file system. These methods collectively form the fs API.
3. Using Object-Oriented Programming (OOP), we can create a class that exposes public methods. These public methods can also be considered an API because they define how other parts of the application interact with the class.

#REST API (Representational State Transfer)

# Rules:

1. Separate the APIs into logical resources.
   Resource: Object or representation of something which has data associated to it. Eg: users, tours, reviews etc.

2. Expose structured resource-based URLs.

   https://www.natours.dev/addNewTour -> Wrong!! (Doesn't follow REST archietecture)
   https://www.natours.dev/getTours -> Wrong!! (Doesn't follow REST archietecture)

   http://www.natours.dev/tours -> Correct (Follows REST archietecture)
   http://www.natours.dev/users -> Correct (Follows REST archietecture)

3. Use HTTP Methods

   For getting a list of users, we should send GET request to http://www.natours.dev/users
   For creating a new user, we should send POST request to http://www.natours.dev/users

   For fetching a specific user, we should send GET request to http://www.natours.dev/users/1

   For deleting a specific user, we should send DELETE request to http://www.natours.dev/users/1

   For updating an existing resource(entirely), we should send a PUT request
   For updating an existing resource(partially), we should send a PATCH request

4. Send data as JSON (usually) -> Use JSON as a data exchange format
5. Be stateless:
   All state should be managed on the client. This means that each request should contain all the information necessary to process that request. The server should not have to remember previous requests.

   /tours/nextPage -> Here server needs to remember the current page and based on that determine the next page -> WRONG!!!!!!! (Not As per REST archietecture)

   /tours/page/3 -> Client sends the page details which it expects and server just processes it.
   CORRECT (As per REST archietecture)

# DAY 2

JSEN pattern of sending responses:

Response structure:

```
{
   status: 'fail'/'error'/'success',
   data: {
   // Data to be sent as part of the response
   }
}
```

If there is a 400 ish error such as 404, 403, 401, 400, we send status as 'fail'
If there is a 500 ish error such as 500, 503, we send status as 'error'
If there is no error, we send status as 'success'

By default express ignores any body data that has been sent as part of an http request.
If we want express to include the body data and parse it as json, we need to use a middleware function called express.json()

Eg: app.use(express.json())

## Middleware Chain:

A middleware chain in Express is the sequence of middleware functions that a request passes through before reaching the final route handler or response.

# DAY 3

The server can expose static assets from inside a particular folder using express.static() method which returns a middleware.
We need to pass the path to the folder containing the assets as an argument.

When we set environment variables, node makes them available inside process.env object along with other internal environment
variables.

In the latest versions of node, while executing a module, we can specify the environment variable file using below syntax:
node --env-file=.env module_name

## Setting env variables through Scripts

Here we define two scripts which will set environment variable NODE_ENV to development/production.
We use cross-env package so that the script can be run on any operating system

"start:dev": "cross-env NODE_ENV=development node app.js",
"start:prod": "cross-env NODE_ENV=production node app.js"
