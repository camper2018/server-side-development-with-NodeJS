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
// const Dishes = require("./models/dishes");
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
app.use(cookieParser());
// auth middleware
const auth = (req, res, next) => {
  console.log(req.headers);
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
      // if authentication is successful, we will send the request object to be handled by subsequent middlewares.
      next();
    } else {
      let err = new Error("You are not authenticated!");
      res.setHeader("WWW-Authenticate", "Basic");
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
