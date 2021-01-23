var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var dishRouter = require("./routes/dishRouter");
var promoRouter = require("./routes/promoRouter");
var leaderRouter = require("./routes/leaderRouter");
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/conFusion";
const connect = mongoose.connect(url);
connect.then(
  (db) => {
    console.log("Connected correctly to server");
  },
  (err) => {
    console.log(err);
  }
);

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// We are going to modify authorization middleware to make use of cookies instead of the authorization header here.
// middleware that sets up signed cookies with the secret string passed is used as a cookie signature.
// The secret key is a key that can be used by our cookie-parser in order to encrypt the information
// and sign the cookie that is sent from the server to the client.
app.use(cookieParser("12345-67890-09876-54321"));
// auth middleware
const auth = (req, res, next) => {
  console.log(req.signedCookies);

  // check that user property in the signed cookies doesn't exist,
  // or even the signed cookie itself doesn't exist,
  // Then, we will expect basic authorization to be done.

  if (!req.signedCookies.user) {
    // The header will have no authorization field when first request is received.
    // We will set authorization header if it is not found so that subsequent requests contain this header.
    // Also will send an error message to the client with status of Unauthorized.

    let authHeader = req.headers.authorization;
    if (!authHeader) {
      let err = new Error("You are not authenticated!");
      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      // passing error to next() will send this error msg to the error handler below.
      next(err);
      return;
    } else {
      let [user, password] = new Buffer.from(authHeader.split(" ")[1], "base64")
        .toString()
        .split(":");
      // here we split the authorization header at space that gives us ['Basic', 'base64 encoded string' ]
      // We futher split base64 string at ':' to get [username, password]
      if (user === "admin" && password === "password") {
        // If the authorization is successful,
        // then we will set up the cookie by using the res.cookie here with user property set to a value of admin.
        res.cookie("user", "admin", { signed: true });
        // if authentication is successful, we will send the request object to be handled by subsequent middlewares.
        next();
      } else {
        let err = new Error("You are not authenticated!");
        res.setHeader("WWW-Authenticate", "Basic");
        err.status = 401;
        next(err);
      }
    }
  } else {
    // Then, all subsequent requests will carry the signed cookie anyway,
    // and then so we will check to see that the signed cookie is a valid signed cookie
    // and contains the user property which is set equal to admin
    // If it does, then this is an authorized access, so we'll allow to proceed forward.
    if (req.signedCookies.user === "admin") {
      next();
    } else {
      // If not, then we'll raise an error at this point.
      let err = new Error("You are not authenticated!");
      err.status = 401;
      next(err);
    }
  }
};
// We are using our auth middleware here right after other middlewares and before express serving static files as we want to serve only to the authenticated users.
app.use(auth);
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
