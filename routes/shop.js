const express = require('express');

const router = express.Router();

const shopController = require('../controllers/shop.js');

// if I pass the path this way -> [url = '/some-path'] it will not accept any other path, if you write a non existing path it will not work
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/cart', shopController.getCart);

router.get('/orders', shopController.getOrders);

router.get('/checkout', shopController.getCheckout);

exports.router = router;
