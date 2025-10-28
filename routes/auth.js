const express = require('express');
const router = express.Router();
const validator = require('../utility/validator.js');

const authController = require('../controllers/auth.js');

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);

router.post(
  '/login',
  [validator.checkEmail, validator.passwordStrength],
  authController.postLogin
);
router.post(
  '/signup',
  [validator.checkEmail, validator.passwordStrength, validator.passwordMatch],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
