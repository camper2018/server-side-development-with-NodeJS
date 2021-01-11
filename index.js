const express = require("express");
const http = require("http");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const hostname = "localhost";
const port = 3000;

const app = express();
// using middlwares in express
app.use(morgan("dev"));
app.use(bodyParser.json());
// when we use the body parser middleware, it parses the body of the incoming request and then adds it on to the request in json format as req.body object.
app.all("/dishes", (req, res, next) => {
  // When we say app.all, no matter which method is invoked, get, put, post, or delete, for the /dishes REST API endpoint,
  // this code will be executed first by default here.
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  next();
  // So when you call next, what it means is that it'll continue on to look for additional specifications that match the dishes endpoint.
  // So this would be done for all the requests, get, put, post, and delete, on the dishes,
  // and it'll continue on to the next one with /dishes endpoint as below.
});

app.get("/dishes", (req, res, next) => {
  // will receive req processed by next() method in app.all().
  res.end("Will send all the dishes to you!");
  // This will send all dishes from mongodb database.
});
app.post("/dishes", (req, res, next) => {
  // will receive req processed by next() method in app.all().
  res.end(
    "Will add the dish: " +
      req.body.name +
      " with details: " +
      req.body.description
  );
});
app.put("/dishes", (req, res, next) => {
  // will receive req processed by next() method in app.all().
  res.statusCode = 403;
  res.end("PUT operation not supported on /dishes");
});
app.delete("/dishes", (req, res, next) => {
  // will receive req processed by next() method in app.all().
  res.end("Deleting all the dishes!");
  // This will send all dishes from mongodb database.
});
app.get("/dishes/:dishId", (req, res, next) => {
  res.end("Will send details of the dish: " + req.params.dishId + " to you!");
});
app.post("/dishes/:dishId", (req, res, next) => {
  res.statusCode = 403;
  res.end("POST operation not supported on /dishes/" + req.params.dishId);
});
app.put("/dishes/:dishId", (req, res, next) => {
  res.write("Updating the dish: " + req.params.dishId + "\n");
  res.end(
    "Will update the dish: " +
      req.body.name +
      " with details: " +
      req.body.description
  );
});
app.delete("/dishes/:dishId", (req, res, next) => {
  res.end("Deleting dish! " + req.params.dishId);
});

app.use(express.static(__dirname + "/public"));
// This is informing Express that you will look at this particular folder in the root folder of this project and inside the public folder.

app.use((req, res, next) => {
  // Express uses additional middleware so, the next is used when you need to invoke additional middleware to take care of work on your behalf.
  // Next is an optional parameter that can be not included if you are not going to use it within your code.
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end("<html><body><h1>This is an Express Server</h1></body></html>");
});

const server = http.createServer(app);
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
