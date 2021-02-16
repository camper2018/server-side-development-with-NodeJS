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
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        (favDishes) => {
          console.log(favDishes);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favDishes);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  // .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  //   // Get the user's favorites list
  //   Favorite.findOne({ user: req.user._id })
  //     .then(
  //       (fav) => {
  //         // if favorites doc not found for the user, then create it with dishes.
  //         if (fav == null) {
  //           Favorite.create({ user: req.user._id, dishes: req.body }).then(
  //             (fav) => {
  //               res.statusCode = 200;
  //               res.setHeader("Content-Type", "application/json");
  //               res.json(fav);
  //             },
  //             (err) => next(err)
  //           );
  //           // Otherwise, add the dishes to the favorites if not already exists.
  //         } else {
  //           req.body.forEach((dish) => {
  //             if (fav.dishes.indexOf(dish._id) === -1) {
  //               fav.dishes.push(dish._id);
  //             }
  //           });

  //           fav.save().then(
  //             (response) => {
  //               res.statusCode = 200;
  //               res.setHeader("Content-Type", "application/json");
  //               res.json(response);
  //             },
  //             (err) => next(err)
  //           );
  //         }
  //       },
  //       (err) => next(err)
  //     )
  //     .catch((err) => next(err));
  // })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // get the user's favorites list
    Favorite.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);
      if (!favorite) {
        Favorite.create({ user: req.user._id })
          .then((favorite) => {
            for (let i = 0; i < req.body.length; i++) {
              if (favorite.dishes.indexOf(req.body[i]._id) < 0) {
                favorite.dishes.push(req.body[i]);
              }
            }
            favorite
              .save()
              .then((favorite) => {
                Favorite.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
              })
              .catch((err) => {
                return next(err);
              });
          })
          .catch((err) => {
            return next(err);
          });
      } else {
        for (let i = 0; i < req.body.length; i++) {
          if (favorite.dishes.indexOf(req.body[i]._id) < 0) {
            favorite.dishes.push(req.body[i]);
          }
        }
        favorite
          .save()
          .then((favorite) => {
            Favorite.findById(favorite._id)
              .populate("user")
              .populate("dishes")
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
          })
          .catch((err) => {
            return next(err);
          });
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  // .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  //   Favorite.findOneAndDelete({ user: req.user._id })
  //     .then(
  //       (result) => {
  //         // if result is not null
  //         if (result) {
  //           res.statusCode = 200;
  //           res.setHeader("Content-Type", "text/plain");
  //           res.end("Successively deleted all Dishes from the favorites! ");
  //         } else {
  //           res.statusCode = 200;
  //           res.setHeader("Content-Type", "text/plain");
  //           res.end("Favorite's list is empty already!");
  //         }
  //       },
  //       (err) => next(err)
  //     )
  //     .catch((err) => next(err));
  // });
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id }, (err, resp) => {
      if (err) return next(err);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(resp);
    });
  });
favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        (favorites) => {
          if (!favorites) {
            res.statusCode = 200;
            res.setHeader("ContentType", "application/json");
            return res.json({ exists: false, favorites: favorites });
            //this exists flag here will be set to true if this dish is part of my favorites.
            // If this dish is not part of my favorites, I will set the exists flag to false.
            // Since the favorites here is null, exists is set to false
          } else {
            // Otherwise, which means the favorites is not null
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
              // if dish doesn't exists in favorites then,
              res.statusCode = 200;
              res.setHeader("ContentType", "application/json");
              return res.json({ exists: false, favorites: favorites });
            } else {
              // if dish exists in list of favorites
              res.statusCode = 200;
              res.setHeader("ContentType", "application/json");
              return res.json({ exists: true, favorites: favorites });
            }
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  // .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  //   // get the user's favorites list
  //   Favorite.findOne({ user: req.user._id })
  //     .then(
  //       (fav) => {
  //         // if user has no favorite dish saved before, then create a new list of favorites.
  //         if (!fav || !fav.user) {
  //           Favorite.create({
  //             user: req.user._id,
  //             dishes: [req.params.dishId],
  //           }).then(
  //             (fav) => {
  //               res.statusCode = 200;
  //               res.setHeader("Content-Type", "application/json");
  //               res.json(fav);
  //             },
  //             (err) => next(err)
  //           );
  //           // if user already has favorites saved,
  //         } else {
  //           // Add dish to the favorites if not already exists.
  //           if (fav.dishes.indexOf(req.params.dishId) === -1) {
  //             fav.dishes.push(req.params.dishId);
  //             fav.save().then(
  //               (response) => {
  //                 res.statusCode = 200;
  //                 res.setHeader("Content-Type", "application/json");
  //                 res.json(response);
  //               },
  //               (err) => next(err)
  //             );
  //           } else {
  //             // if dish already exists in favorites
  //             res.statusCode = 200;
  //             res.setHeader("Content-Type", "text/plain");
  //             res.end("Dish already exists in favorite list!");
  //           }
  //         }
  //       },
  //       (err) => next(err)
  //     )
  //     .catch((err) => next(err));
  // })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);
      if (!favorite) {
        Favorite.create({ user: req.user._id })
          .then((favorite) => {
            favorite.dishes.push({ _id: req.params.dishId });
            favorite
              .save()
              .then((favorite) => {
                Favorite.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
              })
              .catch((err) => {
                return next(err);
              });
          })
          .catch((err) => {
            return next(err);
          });
      } else {
        if (favorite.dishes.indexOf(req.params.dishId) < 0) {
          favorite.dishes.push({ _id: req.params.dishId });
          favorite
            .save()
            .then((favorite) => {
              Favorite.findById(favorite._id)
                .populate("user")
                .populate("dishes")
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                });
            })
            .catch((err) => {
              return next(err);
            });
        } else {
          res.statusCode = 403;
          res.setHeader("Content-Type", "text/plain");
          res.end(
            "Dish " + req.params.dishId + " already exists in favorites!"
          );
        }
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain");
    res.end("PUT operation not supported on /favorites/" + req.params.dishId);
  })
  // .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  //   // Find the user favorites list
  //   Favorite.findOne({ user: req.user._id })
  //     .then((fav) => {
  //       // if Favorite document exists and  favorite dishes list is not empty
  //       if (fav && fav.dishes.length > 0) {
  //         let found = false;
  //         // search for dishId parameter match in the favorites
  //         fav.dishes.forEach((dish, i) => {
  //           if (dish.toString() === req.params.dishId) {
  //             fav.dishes.splice(i, 1);
  //             found = true;
  //           }
  //         });
  //         // if dishId match found and removed, save it
  //         if (found) {
  //           fav.save().then(
  //             (fav) => {
  //               if (fav.dishes.length === 0) {
  //                 // if favorites list is empty, remove the entire favorites document associated with the user.
  //                 Favorite.remove({ user: req.user._id }).then(
  //                   (response) => {
  //                     res.statusCode = 200;
  //                     res.setHeader("Content-Type", "text/plain");
  //                     res.end(
  //                       "Successfully removed Dish with ID: " +
  //                         req.params.dishId
  //                     );
  //                   },
  //                   (err) => next(err)
  //                 );
  //                 // If favorites list is not empty:
  //               } else {
  //                 res.statusCode = 200;
  //                 res.setHeader("Content-Type", "text/plain");
  //                 res.end(
  //                   "Successfully removed Dish with ID: " + req.params.dishId
  //                 );
  //               }
  //             },
  //             (err) => next(err)
  //           );
  //           // If dish with req.params.dishId  not found:
  //         } else {
  //           err = new Error(
  //             "Dish with ID: " + req.params.dishId + " not found!"
  //           );
  //           err.status = 404;
  //           return next(err);
  //         }
  //       } else {
  //         err = new Error("Dish with ID: " + req.params.dishId + " not found!");
  //         err.status = 404;
  //         return next(err);
  //       }
  //     })
  //     .catch((err) => next(err));
  // });
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);
      var index = favorite.dishes.indexOf(req.params.dishId);
      if (index >= 0) {
        favorite.dishes.splice(index, 1);
        favorite
          .save()
          .then((favorite) => {
            Favorite.findById(favorite._id)
              .populate("user")
              .populate("dishes")
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
          })
          .catch((err) => {
            return next(err);
          });
      } else {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("Dish " + req.params._id + " not in your favorite's list!");
      }
    });
  });

module.exports = favoriteRouter;
