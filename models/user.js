// We'll create a simple user schema which tracks the username and password,
// and also a flag that is set to indicate whether the user is an administrator or a normal user.

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("User", User);
