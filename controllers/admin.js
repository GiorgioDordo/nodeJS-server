const Product = require('../models/product.js');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    docTitle: 'Add Product',
    path: '/admin/add-product',
  }); // sending a response to the client
};

exports.postAddProduct = (req, res, next) => {
  console.log(req.body);
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(title, imageUrl, description, price);
  product.save();
  // res.send(`<h1>Product: ${product}</h1>`); // sending a response to the client
  res.redirect('/'); // redirecting the user to the home page
};

exports.getAdminProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    console.log('admin/products.js');
    res.render('admin/products', {
      prods: products,
      docTitle: 'Admin Products',
      path: '/admin/products',
    });
  });
};
