const express = require('express');

const router = express.Router();

const shopController = require('../controllers/shop.js');

const isAuth = require('../middleware/is-auth.js');

// if I pass the path this way -> [url = '/some-path'] it will not accept any other path, if you write a non existing path it will not work
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

exports.router = router;
