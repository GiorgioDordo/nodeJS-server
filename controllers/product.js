const products = [];

exports.getAddProduct = (req, res, next) => {
  res.render('add-product', {
    docTitle: 'Add Product',
    path: '/admin/add-product',
  }); // sending a response to the client
};

exports.postAddProduct = (req, res, next) => {
  console.log(req.body);
  products.push({ title: req.body.title });
  // res.send(`<h1>Product: ${product}</h1>`); // sending a response to the client
  res.redirect('/'); // redirecting the user to the home page
};

exports.getAllProducts = (req, res, next) => {
  console.log('shop.js', products);
  res.render('shop', {
    prods: products,
    docTitle: 'Shop',
    path: '/',
  });
};
