const express = require('express');

const router = express.Router();

const path = require('path');

const rootDir = require('../utility/path');

const products = [];

// next is a function that will be passed to the surrounding function by express.js, and it allows the request to travel to the next middleware
// the method use() accepts an array of so called request handlers
router.get('/add-product', (req, res, next) => {
  res.sendFile(path.join(rootDir, 'views', 'add-product.html')); // sending a response to the client
});

router.post('/add-product', (req, res, next) => {
  console.log(req.body);
  products.push({ title: req.body.title });
  // res.send(`<h1>Product: ${product}</h1>`); // sending a response to the client
  res.redirect('/'); // redirecting the user to the home page
});

exports.router = router;
exports.products = products;
