var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");
var User = new Schema({
  // So now our user document will contain, in addition to the username and password,(ie.username and hash and salt that is automatically added by the passport local Mongoose module )
  // we will also have the first name and last name for the user being defined here.
  //so this way the user's information can simply be retrieved by looking up the user document here.
  firstname: {
    type: String,
    default: "",
  },
  lastname: {
    type: String,
    default: "",
  },
  facebookId: String,
  // The facebookId will store the facebookId of the user that has passed in the access token.
  admin: {
    type: Boolean,
    default: false,
  },
});
// to use passport-local-mongoose as a plugin in our mongoose schema and model, we will add:
User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", User);

// When a user logs in to the facebook account and obtains an access token,
// it passes in the access token to our express server,
// then we will fetch the user profile from facebook by sending this access token togehter with our appId and secret,
// and then will get user profile object back,
// we can use that profile with firstname, lastname and facebookId to setup an account for that user in our local server
// and also saving the profile in our db (user collection).
