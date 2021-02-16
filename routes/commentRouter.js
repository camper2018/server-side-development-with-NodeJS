const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Comments = require("../models/comments");
const commentRouter = express.Router();
commentRouter.use(bodyParser.json());
commentRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Comments.find(req.query)
      .populate("author")
      .then(
        (comments) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(comments);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body !== null) {
      // that means there is comment inside the req.body
      req.body.author = req.user._id; // id of currently logged in user (verified by verifyUser)
      // req.body already carries dish, comment message and rating and we added author as well ,
      // now we can add the comment to the db.
      Comments.create(req.body)
        .then(
          (comment) => {
            Comments.findById(comment._id)
              .populate("author")
              .then((comment) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(comment);
              });
          },
          (err) => next(err)
        )

        .catch((err) => next(err));
    } else {
      // if body doesn't contain comment
      err = new Error("Comment not found in request body");
      err.status = 404;
      return next(err);
    }
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // will receive req processed by next() method in app.all().
    res.statusCode = 403;
    res.end("PUT operation not supported on /comments");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Comments.remove({})
        .then(
          (resp) => {
            res.statusCode = 202;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

commentRouter
  .route("/:commentId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Comments.findById(req.params.commentId)
      .populate("author")
      .then(
        (comment) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(comment);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST operation not supported on /comments/" + req.params.commentId
    );
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
      .then(
        (comment) => {
          if (comment != null) {
            if (!comment.author.equals(req.user._id)) {
              var err = new Error(
                "You are not authorized to update this comment!"
              );
              err.status = 403;
              return next(err);
            }
            req.body.author = req.user._id;
            Comments.findByIdAndUpdate(
              req.params.commentId,
              { $set: req.body },
              { new: true }
            )
              // new: true ensures that that this new updated comment is returned in the body of .then().
              .then(
                (comment) => {
                  Comments.findById(comment._id)
                    .populate("author")
                    .then((comment) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(comment);
                    });
                },
                (err) => next(err)
              );
          } else {
            err = new Error("Comment " + req.params.commentId + " not found!");
            err.status = 404;
            next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
      .then(
        (comment) => {
          if (comment != null) {
            if (!comment.author.equals(req.user._id)) {
              var err = new Error(
                "You are not authorized to delete this comment!"
              );
              err.status = 403;
              return next(err);
            }
            Comments.findByIdAndRemove(req.params.commentId)
              .then(
                (resp) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(resp);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            err = new Error("Comment " + req.params.commentId + " not found!");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = commentRouter;
