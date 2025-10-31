const Product = require('../models/product.js');
const { validationResult } = require('express-validator');
const errorHandler = require('../utility/error-handler.js');

exports.getAddProduct = (req, res, next) => {
  // if (!req.session.isLoggedIn) {
  //   return res.redirect('/login');
  // }
  res.render('admin/edit-product', {
    docTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  }); // sending a response to the client
};

exports.postAddProduct = (req, res, next) => {
  console.log(req.body);
  const title = req.body.title;
  const image = req.body.image;
  const description = req.body.description;
  const price = req.body.price;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        image: image,
        price: price,
        description: description,
      },
      validationErrors: errors.array(),
      errorMessage: errors.array()[0].msg,
    });
  }

  Product.create({
    title: title,
    price: price,
    description: description,
    image: image,
    userId: req.session.user.id,
  })
    .then((result) => {
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      errorHandler.error500(err, next);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then((product) => {
      console.log(product);
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        docTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      errorHandler.error500(err, next);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImage = req.body.image;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const updatedAt = new Date();

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        image: updatedImage,
        price: updatedPrice,
        description: updatedDesc,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findByPk(prodId)
    .then((product) => {
      if (product.userId !== req.session.user.id) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.image = updatedImage;
      product.updatedAt = updatedAt;
      return product.save();
    })
    .then((result) => {
      console.log(result, 'Updated Product');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      errorHandler.error500(err, next);
    });
  // res.send(`<h1>Product: ${product}</h1>`); // sending a response to the client
};

// TODO: ADMIN PRODUCTS //
exports.getAdminProducts = (req, res, next) => {
  Product.findAll({ where: { userId: req.session.user.id } })
    .then((products) => {
      console.log('admin/products.js');
      res.render('admin/products', {
        prods: products,
        docTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch((err) => {
      errorHandler.error500(err, next);
    });
};

// TODO: DELETE PRODUCT //
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.destroy({
    where: { id: prodId, userId: req.session.user.id },
  })
    .then(() => {
      console.log('Deleted Product');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      errorHandler.error500(err, next);
    });
};
