exports.error404 = (req, res, next) => {
  res.status(404).render('404', {
    docTitle: '404',
    path: '',
  });
};

exports.error500 = (req, res, next) => {
  res.status(500).render('500', {
    docTitle: '500',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
  });
};

// commento per testare il webhook !
//testing push webhook !
