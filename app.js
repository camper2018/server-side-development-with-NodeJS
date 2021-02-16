var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
var passport = require("passport");
var authenticate = require("./authenticate");
var config = require("./config");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var dishRouter = require("./routes/dishRouter");
var promoRouter = require("./routes/promoRouter");
var leaderRouter = require("./routes/leaderRouter");
var uploadRouter = require("./routes/uploadRouter");
var favoriteRouter = require("./routes/favoriteRouter");
var commentRouter = require("./routes/commentRouter");
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
connect.then(
  (db) => {
    console.log("Connected correctly to server");
  },
  (err) => {
    console.log(err);
  }
);

var app = express();
// To configure the server such that it will redirect any traffic coming to the unsecure port i.e port 3000 , it'll redirect that request to the secure port.
// So to do that, we will set up a middleware right after we declare the app.express:
app.all("*", (req, res, next) => {
  // app.all means, for all requests no matter what the path in the request is our request coming in, we redirect that.
  if (req.secure) {
    //If the incoming request is already a secure request,
    // then the request object will carry this flag called secure set to true.
    return next();
  } else {
    // If the incoming request is not at secure port, then the req.secure will not be set.
    res.redirect(
      307,
      "https://" + req.hostname + ":" + app.get("secPort") + req.url
      // req.url ---> path or api.
      // 307 here represents that the target resource resides temporarily under different URL.
      // And the user agent must not change the request method if it reforms in automatic redirection to that URL.
      // So, we'll be expecting user agent to retry with the same method that they have used for the original end point.
    );
  }
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/users", usersRouter);
// We are leaving the public folder open for anyone visiting our website.
app.use(express.static(path.join(__dirname, "public")));
// GET requests on all the routes or end-points is accessible to all guests users.
// The other methods requests are available to only authenticated users.
app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);
app.use("/imageUpload", uploadRouter);
app.use("/favorites", favoriteRouter);
app.use("/comments", commentRouter);
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
