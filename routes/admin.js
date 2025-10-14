const express = require('express');

const router = express.Router();

const adminController = require('../controllers/admin.js');

// const path = require('path');

// next is a function that will be passed to the surrounding function by express.js, and it allows the request to travel to the next middleware
// the method use() accepts an array of so called request handlers
router.get('/add-product', adminController.getAddProduct);

router.post('/add-product', adminController.postAddProduct);

router.get('/admin/products', adminController.getAdminProducts);

exports.router = router;
