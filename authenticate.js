// We will configure the passport with the Jason Web Token based strategy here
// and then we will export this from this file as a node module to use it for authentication.

var passport = require("passport");
// passport local module exports a Strategy that we can use for our application to configure local authentication strategies.
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user");
var JwtStrategy = require("passport-jwt").Strategy;
// This will provide us with a JSON Web Token based strategy for configuring our passport module.
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken");
var FacebookTokenStrategy = require("passport-facebook-token");
var config = require("./config");
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

exports.getToken = function (user) {
  // this function when supplied with a parameter user, which is a JSON object,
  // this will create the token and give it for us.
  // It accepts 3 parametes: payload, secret or private key, and options.
  // 3600 seconds means it expires in an hour.
  // In a real application you might set this to be a much longer value maybe a few days
  // and expect the user to re-authenticate themselves every few days.
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};
// Next configure the jsonwebtoken based strategy for our passport application
var opts = {}; // options for jwt based strategy.
// this option specifies how the jsonwebtoken should be extracted from the incoming request message.
//The ExtractJWT supports various methods for extracting information from the header.
// You can also pass the token in the body of the incoming request message and then you can extract it from there,
// you can also use custom extractors and so on.
// Here we are going to use that same header field in the request message as we used for the basic authentication and the cookie-based authentication earlier, to carry the jsonwebtoken.
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
// Here we are specifying the JWT based strategy, then we will create a new JWT strategy.
// This JWT strategy takes the options object that we just created as the first parameter.
// The second parameter is the verify function that we need to supply.
// done() is the callback that is provided by passport.
// This done in passport takes three parameters. error, user, and info.
// Through this done parameter, we will be passing back the strategy information to passport which it will then use for loading things onto the request message.
// If I pass in false as the second parameter, then that means that the user doesn't exist

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);
    // jwt.payload has an id field.
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        // if error
        return done(err, false);
      } else if (user) {
        // if user exists in database
        return done(null, user);
      } else {
        // user doesn't exists
        // if we want, we can create a new user account at this point.
        // but we are keeping it simple here.
        return done(null, false);
      }
    });
  })
);

// This verifyUser will verify or authenticate user using jwt token without using sessions.
exports.verifyUser = passport.authenticate("jwt", { session: false });
// How does the JWT strategy work?
// In the incoming request, the token will be included in the authentication header as a bearer token as we set our strategy method as fromAuthHeaderAsBearerToken().
// The token will then be extracted and used to authenticate the user based upon the token.
// The verifyUser, which calls upon the passport authenticate with JWT uses this token that comes in the authentication header and then verifies the user.
// So, anytime I want to verify the user's authenticity, I can simply call verify user, and that will initiate the call to the passport.authenticate and verify the user.
// exports.verifyAdmin = passport.authenticate("jwt", {
//   session: false,
// });

exports.verifyAdmin = (req, res, next) => {
  console.log("request user: ", req.user);
  if (req.user.admin) {
    next();
  } else {
    let err = new Error("You are not authorized to perform this operation!");
    err.status = 403;
    return next(err);
  }
};
//  or
// The below function works too
// exports.jwtPassport = passport.use(
//   new JwtStrategy(opts, (jwt_payload, done) => {
//     console.log("JWT payload: ", jwt_payload);
//     User.findOne({ _id: jwt_payload._id }, (err, user) => {
//       if (err) {
//         return done(err, false);
//       } else if (user) {
//         console.log("user:", user);
//         if (user.admin == true) {
//           return done(null, user);
//         } else {
//           return done(null, false);
//         }
//       } else {
//         return done(null, false);
//       }
//     });
//   })
// );
// exports.verifyAdmin = passport.authenticate("jwt", { session: false });

// we will configure our application to either create a user or find the user based on the Facebook ID
exports.facebookPassport = passport.use(
  new FacebookTokenStrategy(
    {
      // get the clientId and clientSecret from config.js file
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
    },
    // So these are the four parameters that come into the following callback function
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
          return done(err, fslse);
        }
        if (!err && user !== null) {
          // if this particular Facebook user has logged in earlier so the account would already be configured with the facebookId and user will not be null
          return done(null, user);
        } else {
          // if the user is logging for the first time, user will not exists in db so will create the user
          //This user facebook profile object, will carry a lot of information coming from Facebook that we can use within our application.
          // The accessToken, of course, is supplied to the server by the user.
          user = new User({ username: profile.displayName });
          user.facebookId = profile.id;
          user.firstname = profile.name.givenName;
          user.lastname = profile.name.familyName;
          user.save((err, user) => {
            if (err) {
              return done(err, false);
            } else {
              return done(null, user);
            }
          });
        }
      });
    }
  )
);
