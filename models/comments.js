//Schema and model for comments document
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    // to populate the information into the author field of our comments, we will update our schema
    // So, this way, we are now going to be connecting this author field and this author field will simply store a reference to the ID of the user document, instead of storing the details about the author in the form of a name.
    // Now we can use mongoose populate to populate this information into our dishes document whenever required.
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // reference to corresponding dish id in Dishes document.
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
    },
  },
  {
    timestamps: true,
  }
);

var Comments = mongoose.model("Comment", commentSchema);

module.exports = Comments;
