// This file contains the implementation of the handling of REST API endpoint for /dishes and /dishes:dishId endpoints.
// Since this is a mini-application, we still require express even in this dishRouter.js file.
// And from our knowledge of Node modules, once we define a new file, that becomes its own Node module.
// And this Node module can then be imported in index.js.

// GET requests on all the routes or end-points is accessible to all guests users.
// The other methods requests are available to only authenticated users (i.e we apply authenticate.verifyUser middleware to all those routes.
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Dishes = require("../models/dishes");
const dishRouter = express.Router();
// dishRouter is a mini express application/ module that can be imported into our index.js file.
// A Router instance is a complete middleware
dishRouter.use(bodyParser.json());
// So in our index.js file, we will mount this express router at the /dishes endpoint.

// we'll now update the dish router to use the mongoose population here.
dishRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  // whenever we need to preflight our requests,
  // the client will first send the HTTP OPTIONS request message
  // and then obtain the reply from the server side before it actually sends the actual request.
  // So, for options, if the options message is received on this particular route, then we will respond here with options as above
  .get(cors.cors, (req, res, next) => {
    // Dishes.find({})
    Dishes.find(req.query) // will provide query param featured=true
      // So,this call to the populate will ensure that the other field will be populated with the information as required.
      .populate("comments.author")
      .then(
        (dishes) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  // if a post request comes in, it would first execute this middleware, which we have exported from the authentic.js file,
  //It would verify the user. If this is successful, then it will move on to do the rest of it.
  // If the authentication fails at this point, then passport authenticate will reply back to the client with the appropriate error message.
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.create(req.body)
        .then(
          (dish) => {
            console.log("Dish Created ", dish);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      // will receive req processed by next() method in app.all().
      res.statusCode = 403;
      res.end("PUT operation not supported on /dishes");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.remove({})
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

dishRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("POST operation not supported on /dishes/" + req.params.dishId);
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findByIdAndUpdate(
        req.params.dishId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then(
          (dish) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findByIdAndRemove(req.params.dishId)
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

module.exports = dishRouter;
