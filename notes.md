## Express:

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

## DAY 4

MongoDB is a NoSQL database.
In mongodb, data is stored in collections. (A collection in a NoSQL DB can be compared to a table in a SQL database)
In mongodb, a collection can have multiple documents similar to a table in a sql database which can have multiple rows.
In mongodb, a document can have multiple fields whereas in mysql or other sql databases, a row can have multiple columns.

# SQL(MySQL) vs NoSQL(MongoDB)

## Structure

MySQL (SQL) stores data in tables with fixed rows and columns — like a spreadsheet. Every row must follow the same schema (defined structure: column names, data types). This is called being schema-based or having a rigid schema.

MongoDB (NoSQL) stores data as documents (JSON-like objects called BSON) grouped into collections. Each document can have a different structure — this is schema-less or flexible schema.

## Relationships

MySQL relates data across tables using foreign keys and combines them with JOINs.

MongoDB usually avoids joins by embedding related data directly inside a document (denormalization), though it does support a limited $lookup for joins.

## Scaling

MySQL typically scales vertically (bigger server = more power), though it can scale horizontally with effort (sharding, replication).

MongoDB is built for horizontal scaling — sharding data across multiple servers is a first-class feature.

## Example of Embedding:

```js
// Collection: posts
{
  "_id": ObjectId("64f1a2b3c4d5e6f7890abcde"),
  "title": "Understanding LangGraph State Management",
  "content": "LangGraph uses a StateGraph primitive to...",
  "author": "Nirmalya",
  "tags": ["langgraph", "ai-agents", "typescript"],
  "createdAt": ISODate("2026-06-15T10:00:00Z"),
  "likes": 42,

  // Embedded array of comment documents
  "comments": [
    {
      "commentId": ObjectId("64f1a2b3c4d5e6f7890abcd1"),
      "user": "devUser1",
      "text": "Great explanation of the supervisor pattern!",
      "createdAt": ISODate("2026-06-15T11:30:00Z"),
      "likes": 5
    },
    {
      "commentId": ObjectId("64f1a2b3c4d5e6f7890abcd2"),
      "user": "aiEnthusiast",
      "text": "How does this compare to plain StateGraph?",
      "createdAt": ISODate("2026-06-15T12:15:00Z"),
      "likes": 2,

      // Comments can even be nested (replies embedded further)
      "replies": [
        {
          "user": "Nirmalya",
          "text": "StateGraph is the primitive, supervisor is a pattern built on top.",
          "createdAt": ISODate("2026-06-15T13:00:00Z")
        }
      ]
    }
  ]
}
```

## When to embedd vs when to reference??

# When to Embed:

1. Read together most of the time — If your application almost always needs the parent and its sub-data in the same query (like a post and its comments showing on one page), embedding avoids extra queries or joins and keeps reads fast.

2. Bounded size — If the sub-data has a small, predictable maximum count (e.g., a product has at most 5–10 images), embedding is safe since the document won't keep growing indefinitely.

3. Rarely changes independently — If the sub-data tends to change only when the parent changes (like an address tied to a specific order), embedding keeps everything in sync without extra update logic.

4. Not reused elsewhere — If the sub-data belongs exclusively to one parent and isn't shared across other documents, embedding avoids duplicating the same data in multiple places.

5. Stays well under the 16MB limit — MongoDB documents have a hard cap of 16MB. If you're confident the combined size will always stay small, embedding is safe.

## Example of hybrid approach

Example: Blog Post + Comments

Comments are read together with the post — Since users almost always see comments right below the post content, this pushes toward embedding for a single fast read.

But comments can grow unbounded — A popular post could accumulate thousands of comments, which pushes toward referencing to avoid an oversized, slow-loading document.

Solution: Hybrid approach (Extended Reference Pattern) — Combine both strategies to get the best of each:

-> Embed the last 3–5 recent comments directly inside the post document, so the initial page load is fast and requires no extra query.
-> Store the full comment history in a separate comments collection, with each comment holding a postId field that links back to its post — functioning like a foreign key.

-> Query the full collection only when needed, such as when a user clicks "load all comments," keeping the common case fast and the edge case scalable.

## Horizontal vs Vertical Scaling:

-> Vertical Scaling ("Scale Up")

What it means: Add more power to the existing single machine — more CPU, more RAM, faster SSD/storage.
Analogy: Upgrading one worker to be stronger and faster instead of hiring more workers.

Pros:

Simple — no code or architecture changes needed
No data distribution complexity (everything's still in one place)

Cons:

Hits a physical ceiling — there's a limit to how much RAM/CPU one machine can have
Single point of failure — if that one server goes down, everything goes down
Gets expensive fast at the high end

Example: Upgrading your MySQL server from 16GB RAM to 128GB RAM to handle more queries.

-> Horizontal Scaling ("Scale Out")

What it means: Add more machines and spread the load/data across them, instead of making one machine bigger.
Analogy: Hiring more workers and dividing the work among them.
Pros:

Virtually no ceiling — keep adding servers as you grow
Better fault tolerance — one server failing doesn't take down the whole system
Often cheaper using many commodity servers vs. one giant server

Cons:

More complex — needs data distribution logic (sharding), coordination between nodes
Consistency becomes trickier (ties into CAP theorem — trade-offs between consistency and availability across nodes)

Example: Sharding a MongoDB collection across multiple servers, where each shard holds a portion of the data.

## Mongoose

1. Mongoose is an Object Data Modelling library for MongoDB and Node.js.
2. Mongoose provides a layer of abstraction over Node.js and MongoDB, allowing rapid and simple development and interactions
   with MongoDB.
3. Mongoose helps us with data modelling, relationships, data validation, query API, middlewares etc.
4. With the help of mongoose, we can create schemas for our data by describing the structure of the data, default values,
   validations etc.
5. Once we create the schema for our data using mongoose, we can create a model which serves as a wrapper for the schema
   and which helps us to query the database and perform CRUD operations.
