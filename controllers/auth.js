const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    docTitle: 'Login',
    isAuthenticated: false,
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    docTitle: 'Signup',
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        return res.redirect('/login'); // User not found, redirect and stop
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
            });
          }
          res.redirect('/login'); // Passwords don't match, redirect
        })
        .catch((err) => {
          console.log(err);
          return res.redirect('/login'); // Passwords don't match, redirect and stop
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  User.findOne({ where: { email: email } })
    .then((existingUser) => {
      if (existingUser) {
        return res.redirect('/signup'); // User exists, redirect and stop
      }

      // User doesn't exist, proceed with signup
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          return User.create({
            email: email,
            name: name,
            password: hashedPassword,
          });
        })
        .then((user) => {
          return user.createCart();
        })
        .then(() => {
          res.redirect('/login'); // Success redirect
        });
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/signup');
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.clearCookie('__APP-psfi.x-csrf-token');
    res.clearCookie('x-csrf-token');
    res.redirect('/');
  });
};
