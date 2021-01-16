// Following code demonstrates how we can communicate with the server using the methods that are available through this MongoDB node module or the MongoDB driver.
// We are using nesting callback calls here

const MongoClient = require("mongodb").MongoClient;
// MongoClient enables us to connect to the MongoDB server.
const assert = require("assert");
const url = "mongodb://localhost:27017";
// This is the port number at which your MongoDB server is running 27017
const dbname = "conFusion";
// Now, to access the server, we`ll say MongoClient.connect
//The connect method allows us to connect to the MongoClient from our MongoDB server
MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  //the assert will check if error is equal to null.
  // so the assert function allows us to perform various checks on values.
  // So, we check to make sure that the error is not null,then that means that there is an error and so we will show the error on the screen.
  assert.strictEqual(err, null);
  console.log("Connected correctly to server");
  const db = client.db(dbname);
  const collection = db.collection("dishes");
  collection.insertOne(
    { name: "Uthapizza", description: "test" },
    (err, result) => {
      assert.strictEqual(err, null);
      console.log("After Insert:\n");
      // The ops property tells how many operations have just been carried out successfully.
      console.log(result.ops);
      collection.find({}).toArray((err, docs) => {
        //The parameter docs will return all the documents from this collection that match whatever criteria that we specify here.
        //Since we didn't pass any matching criteria, it will bring all the documents in the collection.
        //We can specify a filter here, saying name is equal to a value, and then only those documents that match that value will be retrieved.
        assert.strictEqual(err, null);
        console.log("Found:\n");
        console.log(docs);

        // dropCollection will drop the specified collection here.
        db.dropCollection("dishes", (err, result) => {
          assert.strictEqual(err, null);
          client.close();
        });
      });
    }
  );
});
