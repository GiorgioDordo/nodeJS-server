// importing the http module that we need to create a server
const bodyParser = require("body-parser");

const express = require("express");

const app = express();

const path = require("path");

const rootDir = require("./utility/path");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

// urlencoded register a middleware like the one we created below and add next() to it so that the request can continue to the next middleware and it also parses the incoming request body and makes it available under req.body
// it can't parse json data, for that we need to use bodyParser.json() and it can't parse files, for that we need to use multer package
app.use(bodyParser.urlencoded({ extended: false })); // I should pass the config options as an object and set extended to false so that I can only parse simple data types like strings and arrays

app.use(express.static(path.join(__dirname, "public"))); // serving static files like css, images, js files

app.use("/admin", adminRoutes); // registering the admin routes\
app.use(shopRoutes); // registering the shop routes

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(rootDir, "views", "404.html"));
});

// creating a server that listens on port 3000
app.listen(3000);
