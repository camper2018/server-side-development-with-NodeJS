var express = require("express");
const bodyParser = require("body-parser");
var User = require("../models/user");
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.post("/signup", (req, res, next) => {
  // to prevent duplicate user entry
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (user !== null) {
        // then the user with that given username already exists,
        // so you should not allow a duplicate signup
        var err = new Error("User " + req.body.username + " already exists");
        err.status = 403; // forbidden
        next(err);
      } else {
        return User.create({
          username: req.body.username,
          password: req.body.password,
        });
      }
    })
    .then(
      (user) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ status: "Registration Successful!", user: user });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});
router.post("/login", (req, res, next) => {
  if (!req.session.user) {
    let authHeader = req.headers.authorization;
    if (!authHeader) {
      let err = new Error("You are not authenticated!");
      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      // passing error to next() will send this error msg to the error handler below.
      next(err);
      return;
    } else {
      let [username, password] = new Buffer.from(
        authHeader.split(" ")[1],
        "base64"
      )
        .toString()
        .split(":");
      User.findOne({ username: username })
        .then((user) => {
          if (user === null) {
            let err = new Error("User " + username + " does not exists!");
            err.status = 403;
            return next(err);
          } else if (user.password !== password) {
            let err = new Error("Your password is incorrect!");
            err.status = 403;
            return next(err);
          } else if (user.username === username && user.password === password) {
            req.session.user = "authenticated";
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end("You are authenticated!");
          }
        })
        .catch((err) => next(err));
    }
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("You are already authenticated!");
  }
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
