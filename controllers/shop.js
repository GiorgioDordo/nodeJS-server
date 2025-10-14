const Product = require('../models/product.js');

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
  res.render('shop/products', { docTitle: 'All Products', path: '/products' }); // sending a response to the client
};

exports.getCart = (req, res, next) => {
  res.render('shop/cart', { docTitle: 'Your Cart', path: '/cart' }); // sending a response to the client
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', { docTitle: 'Checkout', path: '/checkout' }); // sending a response to the client
};
