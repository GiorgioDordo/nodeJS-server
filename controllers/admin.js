const Product = require('../models/product.js');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    docTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  }); // sending a response to the client
};

exports.postAddProduct = (req, res, next) => {
  console.log(req.body);
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(null, title, imageUrl, description, price);
  product.save();
  // res.send(`<h1>Product: ${product}</h1>`); // sending a response to the client
  res.redirect('/'); // redirecting the user to the home page
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId, (product) => {
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      docTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
    }); // sending a response to the client
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const updatedProduct = new Product(
    prodId,
    updatedTitle,
    updatedImageUrl,
    updatedDesc,
    updatedPrice
  );
  updatedProduct.save();
  // res.send(`<h1>Product: ${product}</h1>`); // sending a response to the client
  res.redirect('/admin/products');
};

// TODO: ADMIN PRODUCTS //
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

// TODO: DELETE PRODUCT //
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteById(prodId);
  res.redirect('/admin/products');
};
