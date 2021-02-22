var express = require("express");
const bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
var authenticate = require("../authenticate");
const cors = require("./cors");
// const { authenticate } = require("passport");
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */

// Sometimes a post request with the login will send the options first to check, especially with cors,
// whether the post request will be allowed or not
// by sending status 200 in response to options, we simply allow any request (GET, POST, DELETE, UPDATE)
// for all endpoints under /users if we receive options there.
router.options("*", cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
});
router.get(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  function (req, res, next) {
    User.find({})
      .then(
        (users) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(users);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);
router.post("/signup", cors.corsWithOptions, (req, res, next) => {
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
router.post(
  "/login",
  cors.corsWithOptions,
  //In the login function, we have simply define passport.authenticate local here
  // Now, this passport.authenticate local, if the user doesn't get authenticated, it simply returns an unauthorized in the reply message.
  // That may not be very meaningful for the client side to display this information,
  // so that is why we will enhance this router post login method such that the authentication will return more meaningful information at this point.
  // We will remove the passport.authenticate("local") line and update our function as:

  // passport.authenticate("local"),
  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      // The err will be returned when there is a genuine error that occurs during the authentication process,
      // but the info will contain information if the user doesn't exist or either the username is incorrect or the password is incorrect and so on.
      if (err) return next(err);
      if (!user) {
        // if user is null/ doesn't exists i.e either username or password is incorrect.
        res.statusCode = 401; // Unauthorized
        res.setHeader("Content-Type", "application/json");
        res.json({
          success: false,
          status: "Login Unsuccessful!",
          err: info,
        });
      }
      // note that the above situation will occur if either the username and the password is incorrect,
      // and so this is not an error in the error sense but the fact that the authenticate could not find either the user or the password of the user is incorrect.
      // So, that information will be encoded into the info that comes in and so that we will pass back as an error to our client side.
      // If user exists, the passport.authenticate will add this method called req.logIn to the user.
      // So, at this point, we will just simply pass in the user object that we've obtained.

      req.logIn(user, (err) => {
        if (err) {
          res.statusCode = 401;
          res.setHeader("Content-Type", "application/json");
          res.json({
            success: false,
            status: "Login Unsuccessful!",
            err: "Could not log in user!",
          });
        }
        // So here, if we have reached this point, then that means that the user object is not null and also no error occurred,
        // so that means that the user can be logged in and we would be able to generate the token.
        // So, we'll generate the token based upon the user's ID, and then we'll pass back the token back to the user.
        var token = authenticate.getToken({ _id: req.user._id });
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({
          success: true,
          status: "Login Successful!",
          token: token,
        });
      });
    })(req, res, next);
  }
  // the reason why we do a more elaborate way of handling passport.authentication is that
  // we want to distinguish between the situation where a genuine error occurs during the authentication process as opposed to the situation where the user name is invalid or the password is invalid.
  // So, those two cases will be handled by this situation, where the info will carry the information back to the client.
);
// In addition, we will add in one more method or endpoint below called checkJWTToken. See at the bottom
// It is quite possible that while the client has logged in and obtain the JSON Web Token,
// sometime later, the JSON Web Token may expire.
// So, if the user tries to access from the client side with an expired token to the server, then the server will not be able to authenticate the user.
// So, at periodic intervals, we may wish to cross-check to make sure that the JSON Web Token is still valid.

router.get("/logout", cors.corsWithOptions, (req, res) => {
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
// Now, we're going to be using Facebook for logging in the user
// So if the user sends a get request to users/facebook/token, then we're going to be authenticating the user using the Facebook OAuth 2 based authentication.
router.get(
  "/facebook/token",
  passport.authenticate("facebook-token"),
  (req, res) => {
    if (req.user) {
      // when we call passport.authenticate with the facebook-token strategy, if it is successful, it would have loaded in the user into the request object.
      var token = authenticate.getToken({ _id: req.user._id });
      // So essentially, the user is sending the access token to the express server, the express server uses the accessToken to go to Facebook and then fetch the profile of the user.
      // And if the user doesn't exist, we'll create a new user with that Facebook ID.
      // And then after that, then our express server will generate a JSON web token and then return the JSON web token to our client.
      // All subsequent accesses from our user will have to include this JSON web token that we have just returned by using this approach.
      // So at this point you no longer need the Facebook access token anymore.
      // You can discard the Facebook access token at this point because the JSON web token is the one that keeps the users authentication active for whatever duration that this JSON web token is active.
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        token: token,
        status: "You are successfully logged in!",
      });
    }
  }
);
// So, if you do a get to the checkJWTToken after including the token into the authorization header once the user is logged in,
// then this call will return a true or false to indicate to you whether the JSON Web Token is still valid or not.
// If it is not valid, then the client-side can initiate another login for the user to obtain a new JSON Web Token if required.
router.get("/checkJWTToken", cors.corsWithOptions, (req, res) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      res.statusCode = 401; // unauthorized
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT invalid!", success: false, err: info });
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT valid!", success: true, user: user });
    }
  })(req, res);
});
module.exports = router;

// The user application, the client in this case, will pass in the Facebook access token that it has just obtained from Facebook.
// And then our express server will then use the Facebook access token to verify the user on Facebook.
// And then if the user is acknowledged by Facebook to be a legitimate user, then our express server will return a JSON wed token to our client.
// And then our client is authenticated and then can proceed forward with carrying out the other operations using the JSON wed token in the header of all the request messages, subsequently, just like we did with the local authentication strategy.
