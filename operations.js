// file based node module that contains basic database operations.
const assert = require("assert");
exports.insertDocument = (db, document, collection, callback) => {
  const coll = db.collection(collection);
  // the insert() will return a promise if no callback is provided as an argument.
  return coll.insert(document);
  // coll.insert(document, (err, result) => {
  //   // make sure error is null
  //   assert.strictEqual(err, null);
  //   console.log(
  //     "Inserted " + result.n + " documents into the collection " + collection
  //   );
  //   callback(result);
  // });
};
exports.findtDocuments = (db, collection, callback) => {
  const coll = db.collection(collection);
  return coll.find({}).toArray();
  // coll.find({}).toArray((err, docs) => {
  //   assert.strictEqual(err, null);
  //   console.log(docs);
  //   callback(docs);
  // });
};
exports.removeDocument = (db, document, collection, callback) => {
  const coll = db.collection(collection);
  return coll.deleteOne(document);
  // coll.deleteOne(document, (err, result) => {
  //   assert.strictEqual(err, null);
  //   console.log("Removed the document ", document);
  //   callback(result);
  // });
};
exports.updateDocument = (db, document, update, collection, callback) => {
  const coll = db.collection(collection);
  return coll.updateOne(document, { $set: update }, null);
  // coll.updateOne(document, { $set: update }, null, (err, result) => {
  //   assert.strictEqual(err, null);
  //   console.log("Updated the document with ", update);
  //   callback(result);
  // });
};
