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
    Dishes.find({})
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

dishRouter
  .route("/:dishId/comments")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
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
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            // We updated the dishes schema, so that the author field in the comment will simply store the object ID referring to the user that is posting this comment.
            // We will obtain this user or author information from the body of request as req.user._id.
            // that was inserted by the passport.authenticate('jwt'), once it has varified the user authenticity (see authenticate.js for further details).
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save().then(
              (dish) => {
                // when you're sending back the updated comment or updated dish, then we will populate the comment in the dish here.
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  });
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
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // will receive req processed by next() method in app.all().
    res.statusCode = 403;
    res.end(
      "PUT operation not supported on /dishes" + req.params.dishId + "/comments"
    );
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
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
    }
  );

dishRouter
  .route("/:dishId/comments/:commentId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
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
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST operation not supported on /dishes/" +
        req.params.dishId +
        "/comments/" +
        req.params.commentId
    );
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // find the dish
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          // check if requested comment exists in the dish.
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            // check if comment author is same as requesting user.

            let comment = dish.comments.id(req.params.commentId);
            // console.log("dish.comments:", comment);
            if (req.user._id.equals(comment.author)) {
              if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
              }
              if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment =
                  req.body.comment;
              }
              dish.save().then(
                (dish) => {
                  // when you're sending back the updated comment or updated dish, then we will populate the comment in the dish here.
                  Dishes.findById(dish._id)
                    .populate("comment.author")
                    .then((dish) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(dish);
                    });
                },
                (err) => next(err)
              );
            } else {
              err = new Error("You are not authorized to update this comment!");
              err.status = 403;
              next(err);
            }
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
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) !== null) {
            let comment = dish.comments.id(req.params.commentId);
            if (req.user._id.equals(comment.author)) {
              dish.comments.id(req.params.commentId).remove();
              dish.save().then(
                (dish) => {
                  Dishes.findById(dish._id)
                    .populate("comment.author")
                    .then((dish) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(dish);
                    });
                },
                (err) => next(err)
              );
            } else {
              err = new Error("You are not authorized to delete this comment!");
              err.status = 403;
              next(err);
            }
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
