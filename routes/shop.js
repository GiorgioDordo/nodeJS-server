const express = require('express');

const router = express.Router();

const productsController = require('../controllers/product.js');

// if I pass the path this way -> [url = '/some-path'] it will not accept any other path, if you write a non existing path it will not work
router.get('/', productsController.getAllProducts);

exports.router = router;
