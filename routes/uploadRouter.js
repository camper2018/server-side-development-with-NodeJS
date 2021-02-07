const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const multer = require("multer");
// To use the multer, one of the options that multer takes is for the storage.
// So, multer provides this disk storage function which enables us to define the storage engine and in here we can configure a few things.
// Now, if it is just a matter of configuring the destination, you can simply say dest colon, and then specify the destination folder within which the uploaded files will be stored.
// But here I'm going to do some further configuration for the multer module here.
const cors = require("./cors");
const storage = multer.diskStorage({
  // This function will receive request and also an object called the file, which contains information about the file that has been processed by multer and also a callback function
  destination: (req, file, cb) => {
    // The first paramenter is error, second parameter is the destination folder where our image file will be uploaded.
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    // the second parameter here refers to the file name, that is going to be used for the specific file that has just been uploaded.
    // the original name essentially, gives us the original name of the file from the client side that has been uploaded.
    cb(null, file.originalname);
  },
});
// File filter that enables us to specify which kind of files we are willing to upload or that will be willing to accept for uploading.
const imageFileFilter = (req, file, cb) => {
  // if the file extension does not match any of these things, throw error
  // The file name will be a string so we can use regular expressions to check.
  // So, we are insisting that the only files that they will accept are image files
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("You can upload only image files!"), false);
  }
  cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFileFilter });
const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json());
uploadRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("GET operation not supported on /imageUpload");
    }
  )
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    // make use of the upload which we configured using multer above, which supports a function called as upload.single()
    // Upload single means that it is going to allow me to upload only a single file
    // This single function takes as parameter, the name of the form field, which specifies the uploaded file
    upload.single("imageFile"),
    (req, res) => {
      // When the file is obtained in the code, the upload will take care of handling the errors if there are any.
      // When you come up to this point, the file would have been successfully uploaded
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(req.file); // req.file object
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("PUT operation not supported on /imageUpload");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("DELETE operation not supported on /imageUpload");
    }
  );
module.exports = uploadRouter;
