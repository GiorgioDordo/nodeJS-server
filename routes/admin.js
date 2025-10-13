const express = require('express');

const router = express.Router();

const productsController = require('../controllers/product.js');

// const path = require('path');

// next is a function that will be passed to the surrounding function by express.js, and it allows the request to travel to the next middleware
// the method use() accepts an array of so called request handlers
router.get('/add-product', productsController.getAddProduct);

router.post('/add-product', productsController.postAddProduct);

exports.router = router;
