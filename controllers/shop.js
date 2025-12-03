const Product = require('../models/product.js');
const Cart = require('../models/cart.js');
const Order = require('../models/order.js');
const OrderItem = require('../models/order-item.js');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const errorHandler = require('../utility/error-handler.js');
const doc = require('pdfkit');
const ITEMS_PER_PAGE = 2;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getProducts = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  Product.findAndCountAll({
    offset: (page - 1) * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
    order: [['createdAt', 'DESC']],
  }).then((result) => {
    const totalItems = result.count;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    res.render('shop/product-list', {
      prods: result.rows,
      docTitle: 'All Products',
      path: '/products',
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
    });
  });
};

exports.getIndex = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  console.log('PAGE:', page);
  console.log('=== PAGINATION DEBUG ===');
  console.log('req.query:', req.query);
  console.log('req.query.page (raw):', req.query.page);
  console.log('typeof req.query.page:', typeof req.query.page);
  console.log('Full URL:', req.url);
  console.log('Original URL:', req.originalUrl);

  Product.findAndCountAll({
    offset: (page - 1) * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
    order: [['createdAt', 'DESC']],
  })
    .then((result) => {
      const totalItems = result.count;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      console.log('shop/index.js');
      res.render('shop/index', {
        prods: result.rows,
        docTitle: 'Shop',
        path: '/',
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
      });
    })
    .catch((err) => {
      errorHandler.error500(err, next);
    });
};

// TODO: CART //
exports.getCart = (req, res, next) => {
  req.session.user
    .getCart()
    .then((cart) => {
      console.log('CART', cart);
      return cart
        .getProducts()
        .then((products) => {
          res.render('shop/cart', {
            docTitle: 'Your Cart',
            path: '/cart',
            products: products,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.redirect('/products');
        });
    })
    .catch((err) => {
      errorHandler.error500(err, next);
    });
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
    .catch((err) => {
      errorHandler.error500(err, next);
    });
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
    .catch((err) => {
      errorHandler.error500(err, next);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.session.user
    .getCart()
    .then((cart) => {
      console.log('CART', cart);
      return cart
        .getProducts()
        .then((prods) => {
          products = prods;
          total = 0;
          products.forEach((p) => {
            total += p.price * p.cartItem.quantity;
          });
          return stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: products.map((p) => {
              return {
                quantity: p.cartItem.quantity,
                price_data: {
                  currency: 'eur',
                  unit_amount: Math.round(p.price * 100),
                  product_data: {
                    name: p.title,
                    description: p.description,
                  },
                },
              };
            }),
            success_url:
              req.protocol + '://' + req.get('host') + '/checkout/success',
            cancel_url:
              req.protocol + '://' + req.get('host') + '/checkout/cancel',
          });
        })
        .then((session) => {
          res.render('shop/checkout', {
            docTitle: 'Checkout',
            path: '/checkout',
            products: products,
            totalSum: total,
            sessionId: session.id,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.redirect('/products');
        });
    })
    .catch((err) => {
      errorHandler.error500(err, next);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  let fetchedCart;
  req.session.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      console.log('=== CREATING ORDER ===');
      products.forEach((p) => {
        console.log('Product:', {
          id: p.id,
          title: p.title,
          price: p.price,
          image: p.image,
          quantity: p.cartItem.quantity,
        });
      });
      return req.session.user
        .createOrder()
        .then((order) => {
          return order.addProducts(
            products.map((product) => {
              product.orderItem = {
                quantity: product.cartItem.quantity,
                title: product.title,
                price: product.price,
                imageUrl: product.image,
              };
              console.log('OrderItem data:', product.orderItem);
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
    .catch((err) => {
      console.error('Order creation error:', err);
      errorHandler.error500(err, next);
    });
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
      console.log('=== CREATING ORDER ===');
      products.forEach((p) => {
        console.log('Product:', {
          id: p.id,
          title: p.title,
          price: p.price,
          image: p.image,
          quantity: p.cartItem.quantity,
        });
      });
      return req.session.user
        .createOrder()
        .then((order) => {
          return order.addProducts(
            products.map((product) => {
              product.orderItem = {
                quantity: product.cartItem.quantity,
                title: product.title,
                price: product.price,
                imageUrl: product.image,
              };
              console.log('OrderItem data:', product.orderItem);
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
    .catch((err) => {
      console.error('Order creation error:', err);
      errorHandler.error500(err, next);
    });
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
      }); // sending a response to the client
    })
    .catch((err) => {
      errorHandler.error500(err, next);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findByPk(orderId)
    .then((order) => {
      console.log('=== ORDER DEBUG ===');
      console.log('Order:', order);
      console.log('Order products:', order?.products);
      console.log('Order keys:', Object.keys(order || {}));
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.userId.toString() !== req.session.user.id.toString()) {
        return next(new Error('Unauthorized'));
      }

      // Get OrderItems directly - they have all the snapshot data!
      return OrderItem.findAll({
        where: { orderId: orderId },
      }).then((orderItems) => ({ order, orderItems }));
    })
    .then(({ order, orderItems }) => {
      if (!orderItems || orderItems.length === 0) {
        return next(new Error('No items in this order.'));
      }

      console.log('=== ORDER ITEMS ===');
      orderItems.forEach((item) => {
        console.log('Item:', {
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        });
      });

      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice');
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      orderItems.forEach((item) => {
        const title = item.title || '[Unknown Product]';
        const price = item.price || 0;
        const quantity = item.quantity || 0;

        totalPrice = totalPrice + price * quantity;
        pdfDoc.text(title + ' - ' + quantity + ' x ' + '$' + price);
      });

      pdfDoc.text('Total Price: $' + totalPrice);

      pdfDoc.end();

      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch((err) => {
      return next(err);
    });
};
