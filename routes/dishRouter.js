// This file contains the implementation of the handling of REST API endpoint for /dishes and /dishes:dishId endpoints.
// Since this is a mini-application, we still require express even in this dishRouter.js file.
// And from our knowledge of Node modules, once we define a new file, that becomes its own Node module.
// And this Node module can then be imported in index.js.

const express = require("express");
const bodyParser = require("body-parser");
const dishRouter = express.Router();
// dishRouter is a mini express application/ module that can be imported into our index.js file
dishRouter.use(bodyParser.json());
// So in our index.js file, we will mount this express router at the /dishes endpoint.
dishRouter
  .route("/")
  .all((req, res, next) => {
    // When we say app.all, no matter which method is invoked, get, put, post, or delete, for the /dishes REST API endpoint,
    // this code will be executed first by default here.
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
    // So when you call next, what it means is that it'll continue on to look for additional specifications that match the dishes endpoint.
    // So this would be done for all the requests, get, put, post, and delete, on the dishes,
    // and it'll continue on to the next one with /dishes endpoint as below.
  })
  .get((req, res, next) => {
    // will receive req processed by next() method in app.all().
    res.end("Will send all the dishes to you!");
    // This will send all dishes from mongodb database.
  })
  .post((req, res, next) => {
    // will receive req processed by next() method in app.all().
    res.end(
      "Will add the dish: " +
        req.body.name +
        " with details: " +
        req.body.description
    );
  })
  .put((req, res, next) => {
    // will receive req processed by next() method in app.all().
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })
  .delete((req, res, next) => {
    // will receive req processed by next() method in app.all().
    res.end("Deleting all the dishes!");
    // This will send all dishes from mongodb database.
  });

module.exports = dishRouter;
