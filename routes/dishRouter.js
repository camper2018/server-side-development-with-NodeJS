// This file contains the implementation of the handling of REST API endpoint for /dishes and /dishes:dishId endpoints.
// Since this is a mini-application, we still require express even in this dishRouter.js file.
// And from our knowledge of Node modules, once we define a new file, that becomes its own Node module.
// And this Node module can then be imported in index.js.

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Dishes = require("../models/dishes");
const dishRouter = express.Router();
// dishRouter is a mini express application/ module that can be imported into our index.js file.
// A Router instance is a complete middleware
dishRouter.use(bodyParser.json());
// So in our index.js file, we will mount this express router at the /dishes endpoint.
dishRouter
  .route("/")
  .get((req, res, next) => {
    Dishes.find({})
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
  .post((req, res, next) => {
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
  })
  .put((req, res, next) => {
    // will receive req processed by next() method in app.all().
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })
  .delete((req, res, next) => {
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
  });

dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
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
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on /dishes/" + req.params.dishId);
  })
  .put((req, res, next) => {
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
  })
  .delete((req, res, next) => {
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
  });

dishRouter
  .route("/:dishId/comments")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments);
          } else {
            err = new Error("Dish " + req.params.dishId + " not found");
            err.status = 404;
            // This returned error with status 404 will be handled by our app.js file error handler.
            // refer comment section (render the error page) in app.js file.
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            dish.comments.push(req.body);
            dish.save().then(
              (dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              (err) => next(err)
            );
          } else {
            err = new Error("Dish " + req.params.dishId + " not found");
            err.status = 404;
            // This returned error with status 404 will be handled by our app.js file error handler.
            // refer comment section (render the error page) in app.js file.
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    // will receive req processed by next() method in app.all().
    res.statusCode = 403;
    res.end(
      "PUT operation not supported on /dishes" + req.params.dishId + "/comments"
    );
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            for (var i = dish.comments.length - 1; i >= 0; i--) {
              // to access the subdocument/embeded document 'comments', we need to access each comment one by one by their ids
              // and then perform remove operation on them.
              dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save().then(
              (dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              (err) => next(err)
            );
          } else {
            err = new Error("Dish " + req.params.dishId + " not found");
            err.status = 404;
            // This returned error with status 404 will be handled by our app.js file error handler.
            // refer comment section (render the error page) in app.js file.
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

dishRouter
  .route("/:dishId/comments/:commentId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            // the below line of code will allow us to retrieve a specific comment from the set of comments.
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            // requested dish doesn't exists
            err = new Error("Dish " + req.params.dishId + " not found");
            err.status = 404;
            // This returned error with status 404 will be handled by our app.js file error handler.
            // refer comment section (render the error page) in app.js file.
            return next(err);
          } else {
            // requested comment doesn't exists
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            // This returned error with status 404 will be handled by our app.js file error handler.
            // refer comment section (render the error page) in app.js file.
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST operation not supported on /dishes/" +
        req.params.dishId +
        "/comments/" +
        req.params.commentId
    );
  })
  .put((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            if (req.body.rating) {
              dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
              dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save().then(
              (dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              (err) => next(err)
            );
          } else if (dish == null) {
            // requested dish doesn't exists
            err = new Error("Dish " + req.params.dishId + " not found");
            err.status = 404;
            // This returned error with status 404 will be handled by our app.js file error handler.
            // refer comment section (render the error page) in app.js file.
            return next(err);
          } else {
            // requested comment doesn't exists
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            // This returned error with status 404 will be handled by our app.js file error handler.
            // refer comment section (render the error page) in app.js file.
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) !== null) {
            dish.comments.id(req.params.commentId).remove();
            dish.save().then(
              (dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              (err) => next(err)
            );
          } else if (dish == null) {
            // requested dish doesn't exists
            err = new Error("Dish " + req.params.dishId + " not found");
            err.status = 404;
            // This returned error with status 404 will be handled by our app.js file error handler.
            // refer comment section (render the error page) in app.js file.
            return next(err);
          } else {
            // requested comment doesn't exists
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            // This returned error with status 404 will be handled by our app.js file error handler.
            // refer comment section (render the error page) in app.js file.
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });
module.exports = dishRouter;
