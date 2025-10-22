const Product = require('../models/product.js');
const Cart = require('../models/cart.js');
const Order = require('../models/order.js');

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      console.log('shop/product-list.js');
      res.render('shop/product-list', {
        prods: products,
        docTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      console.log('shop/index.js');
      res.render('shop/index', {
        prods: products,
        docTitle: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Todo:PRODUCT DETAILS //
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then((product) => {
      console.log(product);
      res.render('shop/product-detail', {
        product: product,
        docTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// TODO: CART //
exports.getCart = (req, res, next) => {
  req.session.user.getCart().then((cart) => {
    console.log('CART', cart);
    return cart
      .getProducts()
      .then((products) => {
        res.render('shop/cart', {
          docTitle: 'Your Cart',
          path: '/cart',
          products: products,
          isAuthenticated: req.session.isLoggedIn,
        });
      })
      .catch((err) => console.log(err));
  });
  // Cart.getProducts((cart) => {
  //   Product.fetchAll((products) => {
  //     const cartProducts = [];
  //     for (let product of products) {
  //       const cartProductData = cart.products.find(
  //         (prod) => prod.id === product.id
  //       );
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }
  //     res.render('shop/cart', {
  //       docTitle: 'Your Cart',
  //       path: '/cart',
  //       products: cartProducts,
  //     }); // sending a response to the client
  //   });
  // });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.session.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
        newQuantity = product.cartItem.quantity + 1;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.session.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.session.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return req.session.user
        .createOrder()
        .then((order) => {
          order.addProduct(
            products.map((product) => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch((err) => console.log(err));
    })
    .then(() => {
      return fetchedCart.setProducts(null);
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch((err) => console.log(err));
};

// TODO: ORDERS //
exports.getOrders = (req, res, next) => {
  req.session.user
    .getOrders({ include: ['products'] })
    .then((orders) => {
      res.render('shop/orders', {
        docTitle: 'Your Orders',
        path: '/orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
      }); // sending a response to the client
    })
    .catch((err) => console.log(err));
};
