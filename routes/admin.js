const express = require('express');

const router = express.Router();

const adminController = require('../controllers/admin.js');

const isAuth = require('../middleware/is-auth.js');

const validator = require('../utility/validator.js');

// const path = require('path');

// next is a function that will be passed to the surrounding function by express.js, and it allows the request to travel to the next middleware
// the method use() accepts an array of so called request handlers
router.get('/add-product', isAuth, adminController.getAddProduct);

router.post(
  '/add-product',
  isAuth,
  [
    validator.checkAdminTitle,
    validator.checkAdminImageUrl,
    validator.checkAdminPrice,
    validator.checkAdminDescription,
  ],
  adminController.postAddProduct
);

router.get('/products', isAuth, adminController.getAdminProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  isAuth,
  [
    validator.checkAdminTitle,
    validator.checkAdminImageUrl,
    validator.checkAdminPrice,
    validator.checkAdminDescription,
  ],
  adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

exports.router = router;
