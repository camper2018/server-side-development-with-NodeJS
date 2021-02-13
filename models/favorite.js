var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var favoriteSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dishes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dish",
      },
    ],
  },
  {
    timestamps: true,
  }
);
// to use passport-local-mongoose as a plugin in our mongoose schema and model, we will add:
favoriteSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Favorite", favoriteSchema);
