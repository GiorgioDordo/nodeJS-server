const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// Remove brevoTransport, use direct SMTP instead
function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASS, // Your SMTP key (not API key!)
    },
  });
}

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    docTitle: 'Login',
    isAuthenticated: false,
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let messageSignup = req.flash('errorSignup');
  if (messageSignup.length > 0) {
    messageSignup = messageSignup[0];
  } else {
    messageSignup = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    docTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: messageSignup,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/login', {
      path: '/login',
      docTitle: 'Login',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
    });
  }
  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return req.session.save((err) => {
          if (err) console.log(err);
          res.redirect('/login');
        });
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
          req.flash('error', 'Invalid email or password.');
          return req.session.save((err) => {
            if (err) console.log(err);
            res.redirect('/login');
          });
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
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      docTitle: 'Signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
    });
  }

  User.findOne({ where: { email: email } })
    .then((existingUser) => {
      if (existingUser) {
        req.flash('errorSignup', 'Email already in use.');
        return req.session.save((err) => {
          if (err) console.log(err);
          res.redirect('/signup');
        });
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
          return user.createCart().then(() => user);
        })
        .then((user) => {
          res.redirect('/login'); // Success redirect
          const transporter = getTransporter();
          return transporter.sendMail({
            from: 'dordodeka@gmail.com',
            to: email,
            subject: 'Welcome to Our App!',
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1>Welcome ${name}!</h1>
                <p>Thank you for signing up. Your account has been created successfully.</p>
                <p>You can now log in with your email: <strong>${email}</strong></p>
                <p>Happy shopping!</p>
              </div>
            `,
          });
        })
        .then((info) => {
          console.log('Welcome email sent:', info.messageId);
        })
        .catch((emailErr) => {
          // Don't fail the signup if email fails
          console.log('Error sending welcome email:', emailErr);
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
    // res.clearCookie('x-csrf-token');
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    docTitle: 'Reset Password',
    isAuthenticated: false,
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');
    console.log('Generated reset token and email:', email);

    User.findOne({ where: { email: email } })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return req.session.save((err) => {
            if (err) console.log(err);
            res.redirect('/reset');
          });
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        if (!result) {
          return; // Stop execution if no user was found
        }
        res.redirect('/');
        const transporter = getTransporter();
        return transporter.sendMail({
          from: 'dordodeka@gmail.com',
          to: email,
          subject: 'Password Reset',
          html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1>You requested a password reset!</h1>
                <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                <p>This link will expire in one hour.</p>
              </div>
            `,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    where: { resetToken: token, resetTokenExpiration: { [Op.gt]: Date.now() } },
  })
    .then((user) => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        docTitle: 'New Password',
        isAuthenticated: false,
        errorMessage: message,
        userId: user.id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    where: {
      resetToken: passwordToken,
      resetTokenExpiration: { [Op.gt]: Date.now() },
      id: userId,
    },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect('/login');
      const transporter = getTransporter();
      return transporter.sendMail({
        from: 'dordodeka@gmail.com',
        to: resetUser.email,
        subject: 'Your password has been changed',
        html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1>Your password has been rest successfully!</h1>
                <p>If you did not initiate this change, please contact our support immediately.</p>
              </div>
            `,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
