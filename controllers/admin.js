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
  Product.create({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user.id,
  })
    .then((result) => {
      console.log('---------------------------------------------------------');
      console.log('Created Product', result);
      console.log('---------------------------------------------------------');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findOne({
    where: {
      id: prodId,
      userId: req.user.id,
    },
  })
    // Product.findByPk(prodId)
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
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const updatedAt = new Date();
  Product.update(
    {
      title: updatedTitle,
      price: updatedPrice,
      description: updatedDesc,
      imageUrl: updatedImageUrl,
    },
    {
      where: { id: prodId },
    }
  )
    // Product.findByPk(prodId)
    //   .then((product) => {
    //     product.title = updatedTitle;
    //     product.price = updatedPrice;
    //     product.description = updatedDesc;
    //     product.imageUrl = updatedImageUrl;
    //     product.updatedAt = updatedAt;
    //     return product.save();
    //   })
    .then((result) => {
      console.log(result, 'Updated Product');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
  // res.send(`<h1>Product: ${product}</h1>`); // sending a response to the client
};

// TODO: ADMIN PRODUCTS //
exports.getAdminProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      console.log('admin/products.js');
      res.render('admin/products', {
        prods: products,
        docTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// TODO: DELETE PRODUCT //
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.destroy({
    where: { id: prodId },
  })
    .then(() => {
      console.log('Deleted Product');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};
