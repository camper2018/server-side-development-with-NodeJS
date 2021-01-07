// Node and its core modules

const http = require("http");
const fs = require("fs");
const path = require("path");
const hostname = "localhost";
const port = 3000;
// http.createServer() accepts callback as a parameter
const server = http.createServer((req, res) => {
  console.log("Request for " + req.url + " by method " + req.method);
  if (req.method == "GET") {
    var fileUrl;
    if (req.url == "/") {
      fileUrl = "/index.html";
    } else {
      fileUrl = req.url;
    }
    var filePath = path.resolve("./public" + fileUrl);
    const fileExt = path.extname(filePath);
    if (fileExt == ".html") {
      fs.exists(filePath, (exists) => {
        if (!exists) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html");
          res.end(
            "<html><body><h1>Error 404: " +
              fileUrl +
              " not found</h1></body></html>"
          );
          return;
        }
        res.statusCode = 200;
        res.setHeader("ContentType", "text/html");
        // So this createReadStream method will read in the file from this filePath.
        // And then convert that into stream of bytes,
        // and then they will pipe this through to the response.
        // So that will be included into the response, in the body of the response.
        fs.createReadStream(filePath).pipe(res);
      });
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/html");
      res.end(
        "<html><body><h1>Error 404: " +
          fileUrl +
          " not an HTML file</h1></body></html>"
      );
    }
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html");
    res.end(
      "<html><body><h1>Error 404: " +
        req.method +
        " not supported</h1></body></html>"
    );
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
