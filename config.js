// We will store some configuration information for our server here
// to centralize all the configurations for our server.

module.exports = {
  // secret key will be used for signing JSON Web Token
  secretKey: "12345-67890-09876-54321",
  mongoUrl: "mongodb://localhost:27017/conFusion",
};
