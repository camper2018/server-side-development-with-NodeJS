//Schema and model for dishes document
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const dishSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    // this will automatically add the created at and updated at, two timestamps into each document that is stored in our application and will automatically update these values.
    timestamps: true,
  }
);
var Dishes = mongoose.model("Dish", dishSchema);

module.exports = Dishes;
