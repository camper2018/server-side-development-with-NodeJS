// We'll create a simple user schema which tracks the username and password,
// and also a flag that is set to indicate whether the user is an administrator or a normal user.
// We will update the user schema and model to use the passport-local-mongoose.
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");
var User = new Schema({
  // We removed username and password fields from schema as passport-local-mongoose automatically adds them for us.
  // It will add support for username and hashed storage of the password using the hash and salt(randomly generated string)
  // and also will add additional methods on the user schema and the model which are useful for passport authentication.
  admin: {
    type: Boolean,
    default: false,
  },
});
// to use passport-local-mongoose as a plugin in our mongoose schema and model, we will add:
User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", User);
