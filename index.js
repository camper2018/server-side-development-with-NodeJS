const express = require("express");
const http = require("http");
const morgan = require("morgan");

const hostname = "localhost";
const port = 3000;

const app = express();
app.use(morgan("dev"));

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
