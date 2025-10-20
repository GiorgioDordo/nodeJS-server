const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.js');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

module.exports = router;
