const { check, body } = require('express-validator');
const User = require('../models/user.js');

exports.checkEmail = body('email')
  .isEmail()
  .withMessage('Please enter a valid email.');

exports.doesExistAlreadyEmail = body('email').custom((value, { req }) => {
  return User.findOne({ where: { email: value } }).then((existingUser) => {
    if (existingUser) {
      return Promise.reject('E-Mail already in use.');
    }
  });
});

exports.doesExistEmail = body('email').custom((value, { req }) => {
  return User.findOne({ where: { email: value } }).then((existingUser) => {
    if (!existingUser) {
      return Promise.reject('E-mail not found.');
    }
  });
});

exports.passwordStrength = body('password')
  .isStrongPassword({
    minlength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  .withMessage(
    'Please enter a password with at least 8 characters, including 1 uppercase, 1 lowercase, 1 number, and 1 symbol.'
  );

exports.passwordMatch = body('confirmPassword').custom((value, { req }) => {
  if (value !== req.body.password) {
    throw new Error('Passwords have to match!');
  }
  return true;
});

exports.checkLoginPasswordMatch = body('password').custom((value, { req }) => {
  return User.findOne({ where: { password: req.body.password } }).then(
    (user) => {
      if (!user) {
        return Promise.reject('Incorrect password.');
      }
    }
  );
});
