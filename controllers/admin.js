const Product = require('../models/product.js');
const { validationResult } = require('express-validator');
const errorHandler = require('../utility/error-handler.js');
const fileHelper = require('../utility/file.js');
const ITEMS_PER_PAGE = 2;

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
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;

  console.log('REQ BODY:', req.body);
  console.log('MULTER', image);

  // const imageToUse =
  //   image || (existingImagePath ? { path: existingImagePath } : null);

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationErrors: [],
      errorMessage: 'Attached file is not an image.',
    });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationErrors: errors.array(),
      errorMessage: errors.array()[0].msg,
    });
  }

  const imageUrl = image.path;

  Product.create({
    title: title,
    price: price,
    description: description,
    image: imageUrl,
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
  const updatedImage = req.file;
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
      if (updatedImage) {
        fileHelper.deleteFile(product.image);
        product.image = updatedImage.path;
      }
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
  const page = parseInt(req.query.page) || 1;
  Product.findAndCountAll({
    where: { userId: req.session.user.id },
    offset: (page - 1) * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
    order: [['createdAt', 'DESC']],
  })
    .then((result) => {
      const totalItems = result.count;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      console.log('admin/products.js');
      res.render('admin/products', {
        prods: result.rows,
        docTitle: 'Admin Products',
        path: '/admin/products',
        currentPage: page,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
      });
    })
    .catch((err) => {
      errorHandler.error500(err, next);
    });
};

// TODO: DELETE PRODUCT //
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error('Product not found.'));
      }
      fileHelper.deleteFile(product.image);
      return Product.destroy({
        where: { id: prodId, userId: req.session.user.id },
      });
    })
    .then(() => {
      console.log('Deleted Product');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      errorHandler.error500(err, next);
    });
};

//comment
//test
//test2
//test 3
//test 4
//test 5
//test 6
//test 7
//test 8
//test 9
//test 10
//test 11
//test 12
//test 13
// test 14
//test 15
// test 16
// test 17
// test 18
// test 19
// test 20
// test 21
