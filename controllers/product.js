const Product = require('../models/product.js');

exports.getAddProduct = (req, res, next) => {
  res.render('add-product', {
    docTitle: 'Add Product',
    path: '/admin/add-product',
  }); // sending a response to the client
};

exports.postAddProduct = (req, res, next) => {
  console.log(req.body);
  const product = new Product(req.body.title);
  product.save();
  // res.send(`<h1>Product: ${product}</h1>`); // sending a response to the client
  res.redirect('/'); // redirecting the user to the home page
};

exports.getAllProducts = (req, res, next) => {
  const products = Product.fetchAll((products) => {
    console.log('shop.js');
    res.render('shop', {
      prods: products,
      docTitle: 'Shop',
      path: '/',
    });
  });
};
