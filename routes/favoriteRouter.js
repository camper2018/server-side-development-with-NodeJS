const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favorite = require("../models/favorite");
const User = require("../models/user");
const Dishes = require("../models/dishes");
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());
favoriteRouter
  .route("/")
  .options(cors.cors, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        (favDishes) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favDishes);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Get the user's favorites list
    Favorite.findOne({ user: req.user._id })
      .then(
        (fav) => {
          // if favorites doc not found for the user, then create it with dishes.
          if (fav == null) {
            Favorite.create({ user: req.user._id, dishes: req.body }).then(
              (fav) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(fav);
              },
              (err) => next(err)
            );
            // Otherwise, add the dishes to the favorites if not already exists.
          } else {
            req.body.forEach((dish) => {
              if (fav.dishes.indexOf(dish._id) === -1) {
                fav.dishes.push(dish._id);
              }
            });

            fav.save().then(
              (response) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(response);
              },
              (err) => next(err)
            );
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then(
        (result) => {
          // if result is not null
          if (result) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json("Successively deleted all Dishes from the favorites! ");
          } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json("Favorite's list is empty already!");
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites/" + req.params.dishId);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // get the user's favorites list
    Favorite.find({ user: req.user._id })
      .then(
        (fav) => {
          // if user has no favorite dish saved before, then create a new list of favorites.
          if (!fav[0] || !fav[0].user) {
            Favorite.create({
              user: req.user._id,
              dishes: [req.params.dishId],
            }).then(
              (fav) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(fav);
              },
              (err) => next(err)
            );
            // if user already has favorites saved,
          } else {
            // Add dish to the favorites if not already exists.
            if (fav[0].dishes.indexOf(req.params.dishId) === -1) {
              fav[0].dishes.push(req.params.dishId);
              fav[0].save().then(
                (response) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(response);
                },
                (err) => next(err)
              );
            } else {
              // if dish already exists in favorites
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json("Dish already exists in favorite list!");
            }
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Find the user favorites list
    Favorite.find({ user: req.user._id })
      .then((fav) => {
        // if Favorite document exists and  favorite dishes list is not empty
        if (fav[0] && fav[0].dishes.length > 0) {
          let found = false;
          // search for dishId parameter match in the favorites
          fav[0].dishes.forEach((dish, i) => {
            // console.log(dish.toString(), req.params.dishId);
            if (dish.toString() === req.params.dishId) {
              fav[0].dishes.splice(i, 1);
              // console.log("removed: ", fav[0].dishes);
              found = true;
            }
          });
          // if dishId match found and removed, save it
          if (found) {
            // console.log("fav after delete: ", fav);
            fav[0].save().then(
              (fav) => {
                if (fav.dishes.length === 0) {
                  // if favorites list is empty, remove the entire favorites document associated with the user.
                  Favorite.remove({ user: req.user._id }).then(
                    (response) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(
                        "Successfully removed Dish with ID: " +
                          req.params.dishId
                      );
                    },
                    (err) => next(err)
                  );
                  // If favorites list is not empty:
                } else {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(
                    "Successfully removed Dish with ID: " + req.params.dishId
                  );
                }
              },
              (err) => next(err)
            );
            // If dish with req.params.dishId  not found:
          } else {
            err = new Error(
              "Dish with ID: " + req.params.dishId + " not found!"
            );
            err.status = 404;
            return next(err);
          }
        } else {
          err = new Error("Dish with ID: " + req.params.dishId + " not found!");
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
