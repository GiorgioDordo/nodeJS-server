const express = require('express');

const router = express.Router();

const path = require('path');

const rootDir = require('../utility/path');

// if I pass the path this way -> [url = '/some-path'] it will not accept any other path, if you write a non existing path it will not work
router.get('/', (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'shop.html')); // sending a response to the client
}); 

module.exports = router;

