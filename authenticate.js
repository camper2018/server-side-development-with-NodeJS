// We will configure the passport with the new local strategy here and then we will export this from this file as a node module to use it for authentication.

var passport = require("passport");
// passport local module exports a Strategy that we can use for our application to configure local authentication strategies.
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user");
exports.local = passport.use(new LocalStrategy(User.authenticate()));
// Since we are using passport mongoose plugin, the mongoose plugin itself adds this function called user.authenticate to the user schema and model.
// This verify function will be called with the username and password as parameters, that passport will extract from the body of our incoming request in the form of json string (As we are using body-parser in our app, it will automatically provide it as json string in the body of the request).
//If we are not using passport-local-mongoose, then we need to write our own user authentication function and use it here.

// Also since we are still using sessions to track users in our application, we need to serialize and deserialize the user.
// The passport.authenticate() mounts the user property on the request object (ie.req.user) which keeps username and password info.
// serializeUser basically takes that user information and stores in in the session.
// These two functions serializeUser and deserializeUser are provided on the user schema and model by the use of the passport-local-mongoose plugin.
// So they will take care of whatever it is required for our support for sessions in passport.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
