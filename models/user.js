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
  admin: {
    type: Boolean,
    default: false,
  },
});
// to use passport-local-mongoose as a plugin in our mongoose schema and model, we will add:
User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", User);
