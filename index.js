// Following code demonstrates how we can communicate with the server using the methods that are available through this MongoDB node module or the MongoDB driver.
// We are using nesting callback calls here

const MongoClient = require("mongodb").MongoClient;
// MongoClient enables us to connect to the MongoDB server.
const assert = require("assert");
const dboper = require("./operations");
const url = "mongodb://localhost:27017";
// This is the port number at which your MongoDB server is running 27017
const dbname = "conFusion";
// Now, to access the server, we`ll say MongoClient.connect
//The connect method allows us to connect to the MongoClient from our MongoDB server
MongoClient.connect(url, { useUnifiedTopology: true })
  .then((client) => {
    //the assert will check if error is equal to null.
    // so the assert function allows us to perform various checks on values.
    // So, we check to make sure that the error is not null,then that means that there is an error and so we will show the error on the screen.
    // assert.strictEqual(err, null);
    console.log("Connected correctly to server");
    const db = client.db(dbname);
    dboper
      .insertDocument(db, { name: "Vadonut", description: "Test" }, "dishes")
      .then((result) => {
        console.log("Insert Document:\n ", result.ops);
        return dboper.findtDocuments(db, "dishes");
      })
      .then((docs) => {
        console.log("Found Documents:\n", docs);
        return dboper.updateDocument(
          db,
          { name: "Vadonut" },
          { description: "Updated Test" },
          "dishes"
        );
      })
      .then((result) => {
        console.log("Updated Document:\n", result.result);
        return dboper.findtDocuments(db, "dishes");
      })
      .then((docs) => {
        console.log("Found Documents:\n", docs);
        return db.dropCollection("dishes");
      })
      .then((result) => {
        console.log("Dropped Collection: ", result);
        return client.close();
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));
