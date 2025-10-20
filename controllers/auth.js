exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    docTitle: 'Login',
    path: '/login',
  }); // sending a response to the client
};

exports.postLogin = (req, res, next) => {
  req.isLoggedIn = true;
  res.redirect('/'); // sending a response to the client
};
