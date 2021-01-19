//Schema and model for dishes document
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;
// this will load this new currency type into Mongoose,
//So that we can make use of this in defining the schema in our application.

const commentSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
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
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: "",
    },
    price: {
      type: Currency,
      required: true,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    // storing all the comments about the dish inside the dish itself as an array of comment documents.
    comments: [commentSchema],
  },
  {
    // this will automatically add the created at and updated at, two timestamps into each document that is stored in our application and will automatically update these values.
    timestamps: true,
  }
);
var Dishes = mongoose.model("Dish", dishSchema);

module.exports = Dishes;
