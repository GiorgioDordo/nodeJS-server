exports.getLogin = (req, res, next) => {
  //   const cookieHeader = req.get('Cookie'); // Raw cookie string
  // console.log('Raw cookies:', cookieHeader); // "isLoggedIn=true; theme=dark; sessionId=123"

  // let isLoggedIn = false;

  // if (cookieHeader) {
  //   // Split cookies and find the one we want
  //   const cookies = cookieHeader.split(';');
  //   const loginCookie = cookies.find(cookie =>
  //     cookie.trim().startsWith('isLoggedIn=')
  //   );

  //   if (loginCookie) {
  //     const cookieValue = loginCookie.trim().split('=')[1];
  //     isLoggedIn = cookieValue === 'true';
  //   }
  // }

  // console.log('Extracted isLoggedIn:', isLoggedIn);
  console.log('COOKIE VALUE: =>', req.cookies);
  res.render('auth/login', {
    docTitle: 'Login',
    path: '/login',
    isAuthenticated: Boolean(req.cookies.isLoggedIn),
  }); // sending a response to the client
};

exports.postLogin = (req, res, next) => {
  res.setHeader('Set-Cookie', 'isLoggedIn=true;');
  res.redirect('/'); // sending a response to the client
};

exports.postLogout = (req, res, next) => {
  res.clearCookie('isLoggedIn');
  res.redirect('/'); // sending a response to the client
};
