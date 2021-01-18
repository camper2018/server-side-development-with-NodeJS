const mongoose = require("mongoose");
const Dishes = require("./models/dishes");
// to connect to mongodb server:
const url = "mongodb://localhost:27017/conFusion";
const connect = mongoose.connect(
  url,
  { useNewUrlParser: true },
  { useUnifiedTopology: true }
);
// connect method returns a promise
connect.then((db) => {
  console.log("Connected correctly to server");
  Dishes.create({
    name: "Uthapizza",
    description: "test",
  })

    .then((dish) => {
      console.log(dish);
      return Dishes.findByIdAndUpdate(
        dish._id,
        {
          $set: { description: "Updated test" },
        },
        {
          // new: true means that once the update of the dish is complete,
          // then this will return the updated dish back to us.
          new: true,
        }
      ).exec();
      // The exec will ensure that this is executed and it will return a promise
    })
    .then((dish) => {
      console.log(dish);
      dish.comments.push({
        rating: 5,
        comment: "I'm getting a sinking feeling!",
        author: "Leonardo di Carpaccio",
      });
      return dish.save();
    })
    .then((dish) => {
      console.log(dish);
      // return Dishes.remove({});
      return Dishes.deleteMany();
    })
    .then(() => {
      return mongoose.connection.close();
    })
    .catch((err) => {
      console.log(err);
    });
});
