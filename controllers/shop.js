const Product = require('../models/product.js');
const Cart = require('../models/cart.js');

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    console.log('shop/product-list.js');
    res.render('shop/product-list', {
      prods: products,
      docTitle: 'All Products',
      path: '/products',
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll((products) => {
    console.log('index');
    res.render('shop/index', {
      prods: products,
      docTitle: 'Shop',
      path: '/',
    });
  });
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    console.log('product-list');
    res.render('shop/product-list', {
      prods: products,
      docTitle: 'All Products',
      path: '/products',
    });
  });
};

//Todo:PRODUCT DETAILS //
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId, (product) => {
    console.log(product);
    console.log('details', prodId);
    res.render('shop/product-detail', {
      product: product,
      docTitle: product.title,
      path: '/products',
    }); // sending a response to the client
  });
};

// TODO: CART //
exports.getCart = (req, res, next) => {
  res.render('shop/cart', { docTitle: 'Your Cart', path: '/cart' }); // sending a response to the client
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect('shop/cart');
};

// TODO: ORDERS //
exports.getOrders = (req, res, next) => {
  res.render('shop/orders', { docTitle: 'Your Orders', path: '/orders' }); // sending a response to the client
};

// TODO: CHECKOUT //
exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', { docTitle: 'Checkout', path: '/checkout' }); // sending a response to the client
};
