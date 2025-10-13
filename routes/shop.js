const express = require('express');

const router = express.Router();

const path = require('path');

const rootDir = require('../utility/path');

const adminData = require('./admin');

// if I pass the path this way -> [url = '/some-path'] it will not accept any other path, if you write a non existing path it will not work
router.get('/', (req, res, next) => {
  console.log('shop.js', adminData.products);
  res.render('shop', {
    prods: adminData.products,
    docTitle: 'Shop',
    path: '/',
  });
});

exports.router = router;
