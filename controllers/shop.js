const Product = require('../models/product.js');
const Cart = require('../models/cart.js');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      console.log('shop/product-list.js');
      res.render('shop/product-list', {
        prods: rows,
        docTitle: 'All Products',
        path: '/products',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render('shop/index', {
        prods: rows,
        docTitle: 'Shop',
        path: '/',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Todo:PRODUCT DETAILS //
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(([product]) => {
      console.log(product);
      res.render('shop/product-detail', {
        product: product[0],
        docTitle: product.title,
        path: '/products',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// TODO: CART //
exports.getCart = (req, res, next) => {
  Cart.getProducts((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      for (let product of products) {
        const cartProductData = cart.products.find(
          (prod) => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      res.render('shop/cart', {
        docTitle: 'Your Cart',
        path: '/cart',
        products: cartProducts,
      }); // sending a response to the client
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect('/cart');
  });
};

// TODO: ORDERS //
exports.getOrders = (req, res, next) => {
  res.render('shop/orders', { docTitle: 'Your Orders', path: '/orders' }); // sending a response to the client
};

// TODO: CHECKOUT //
exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', { docTitle: 'Checkout', path: '/checkout' }); // sending a response to the client
};
