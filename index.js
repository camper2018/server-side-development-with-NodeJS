const express = require("express");
const http = require("http");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const dishRouter = require("./routes/dishRouter");
const promoRouter = require("./routes/promoRouter");
const leaderRouter = require("./routes/leaderRouter");
const hostname = "localhost";
const port = 3000;

const app = express();
// using middlwares in express
app.use(morgan("dev"));
app.use(bodyParser.json());
// when we use the body parser middleware, it parses the body of the incoming request and then adds it on to the request in json format as req.body object.
app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);
// any request coming to /dishes endpoint will be handled by dishRouter module. As dishRouter.route has been defined as "/" which means it is mounted at "/dishes" endpoint.

app.use(express.static(__dirname + "/public"));
// This is informing Express that you will look at this particular folder in the root folder of this project and inside the public folder.
// Will server static html file in public folder,
// and by default it will serve index.html,
// otherwise will serve the specidfied file in the url.
// For example: localhost:3000/aboutus.html will serve aboutus.html and,
// localhost:3000/index.html will serve index.html.

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
