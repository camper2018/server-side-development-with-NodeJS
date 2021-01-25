var express = require("express");
const bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
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
        passport.authenticate("local")(req, res, () => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({
            success: true,
            status: "Registration Successful!",
          });
          // When this json is received nn our client side, the client can simply extract the success property
          // and check if it is true or not to quickly identify if the registration was successful.
        });
      }
    }
  );
});
router.post("/login", passport.authenticate("local"), (req, res, next) => {
  // We will add passport.authenticate("local") as a second middleware here.
  // So when the router post comes in on the login endpoint, we will first call the passport authenticate local.
  // If this is successful then this will come in and the next function that follows will be executed.
  // If there is any error in the authentication, this passport authenticate local will automatically send back a reply to the client about the failure of the authentication.
  // So that is already taken care of.
  // Unlike the earlier case where we were including username and password in the authorization header,
  // here we expect this to be included in the body of the incoming post message.
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({ success: true, status: "You are successfully logged in!" });
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
