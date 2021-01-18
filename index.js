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
      return Dishes.find({}).exec();
      // The exec will ensure that this is executed and it will return a promise
    })
    .then((dishes) => {
      console.log(dishes);
      return Dishes.remove({});
      // return Dishes.deleteMany();
    })
    .then(() => {
      return mongoose.connection.close();
    })
    .catch((err) => {
      console.log(err);
    });
});
