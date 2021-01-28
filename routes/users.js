var express = require("express");
const bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
var authenticate = require("../authenticate");
// const { authenticate } = require("passport");
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get(
  "/",
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  function (req, res, next) {
    User.find({}).then(
      (users) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(users);
      },
      (err) => next(err)
    );
    // .catch((err) => next(err));
  }
);
router.post("/signup", (req, res, next) => {
  //the mongoose plugin provides us with a method called register, on the user schema and model which we will use here.
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        // after the user is successfully registered with the given username and the given password,
        // then we will set the first name and last name field of the user document here.
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lasttname;
        }
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({
              success: true,
              status: "Registration Successful!",
            });
          });
          // When this json is received nn our client side, the client can simply extract the success property
          // and check if it is true or not to quickly identify if the registration was successful.
        });
      }
    }
  );
});
// In the login endpoint, we are still using local strategy (ie.the username and password) to authenticate the user.Then will isssue Jwt token.
//Once authenticated, all of the subsequent requests will simply carry the token in the header of the incoming request message.
// When the user is authenticated, we're not going to be using sessions anymore.
// Instead, when the user is authenticated using the local strategy, we will issue a token to the user.
router.post("/login", passport.authenticate("local"), (req, res, next) => {
  var token = authenticate.getToken({ _id: req.user._id });
  // The user ID is sufficient enough here as a payload, to search in the MongoDB for the user.
  // If we choose to, we can include other parts of the user information as well here, but I would suggest that keep the JsonWebToken as small as possible.
  // Now, we know that the req.user would be already present, because when the passport.authenticate('local') successfully authenticates the user, this is going to load up the user property onto the request message.
  // We will add passport.authenticate("local") as a second middleware here.
  // So when the router post comes in on the login endpoint, we will first call the passport authenticate local.
  // If this is successful then this will come in and the next function that follows will be executed.
  // If there is any error in the authentication, this passport authenticate local will automatically send back a reply to the client about the failure of the authentication.
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({
    success: true,
    token: token,
    status: "You are successfully logged in!",
  });
});
router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy();
    // the session itself provides this method called destroy and when you call the destroy method,
    // the session is destroyed and the information is removed from the server side pertaining to this session.
    res.clearCookie("session-id");
    // Once logout, if the client tries to connect again using the expired session information stored in the form of a signed cookie on the client side, that will be invalid.
    // So we need to delete the cookie that is stored on the client side as well.
    // session-id is the name of the cookie we stored at client-side.
    res.redirect("/");
  } else {
    var err = new Error("You are not logged in!");
    err.status = 403; // forbidden
    next(err);
  }
});
module.exports = router;
