// configure cors module
const express = require("express");
const cors = require("cors");
const app = express();
// The whitelist contains all the origins that this server is willing to accept.
const whitelist = ["http://localhost:3000", "https://localhost:3443"];
var corsOptionsDelegate = (req, callback) => {
  var corsOptions;
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true };
    // origin true means allow it to be accepted.
    // So when I set origin is equal to true here,
    // then my cors Module will reply back saying access control allow origin,
    // and then include that origin into the headers with the access control allow origin key there.
    // So that way my client side will be informed saying it's okay for the server to accept this request for this particular origin
  } else {
    corsOptions = { origin: false };
    // So when you set origin to false, then the access controller allowOrigin will not be returned by my server site.
  }
  callback(null, corsOptions);
};
exports.cors = cors();
// this will reply back with access control allowOrigin with the wild card (*), means allow every origin.
exports.corsWithOptions = cors(corsOptionsDelegate);
// this will allow access only with origins in white list.
//  if you need to apply A cors with specific options to a particular route, we will use this function. Otherwise, we'll simply use the standard cors
