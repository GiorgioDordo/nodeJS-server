require('dotenv').config();
// importing the http module that we need to create a server
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { doubleCsrf: csrf } = require('csrf-csrf');
const flash = require('@codecorn/connect-flash-new');

// importing controllers and routes
const errorPage = require('./controllers/404.js');
const sequelize = require('./utility/database.js');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// importing models
const Product = require('./models/product.js');
const User = require('./models/user.js');
const Cart = require('./models/cart.js');
const CartItem = require('./models/cart-item.js');
const Order = require('./models/order.js');
const OrderItem = require('./models/order-item.js');
const { error } = require('console');

const app = express();

const sessionStore = new SequelizeStore({
  db: sequelize,
});

const csrfProtection = csrf({
  getSecret: () => 'supersecret',
  getTokenFromRequest: (req) => req.body.csrfToken,
  // __HOST and __SECURE are blocked in chrome, change name
  cookieName: '__APP-psfi.x-csrf-token',
});

app.set('view engine', 'ejs'); // setting the template engine
app.set('views', 'views'); // setting the views directory

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

app.use(cookieParser('supersecret'));
app.use(csrfProtection.doubleCsrfProtection);

app.use(flash());

app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('=== CSRF DEBUG ===');
    console.log('URL:', req.url);
    console.log('Session ID:', req.sessionID);
    console.log('Body token:', req.body.csrfToken);
    console.log('Cookie token:', req.cookies['x-csrf-token']);
    console.log('Headers:', req.headers['x-csrf-token']);
  }

  if (req.method === 'GET') {
    console.log('=== GET REQUEST DEBUG ===');
    console.log('URL:', req.url);
    console.log('Session ID:', req.sessionID);
    console.log('Cookie exists:', !!req.cookies['x-csrf-token']);
  }

  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  // Fetch fresh user from database to get Sequelize methods
  User.findByPk(req.session.user.id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.session.user = user; // Replace the plain object with Sequelize instance
      next();
    })
    .catch((err) => {
      throw new Error(err);
      // console.log(err);
      // next();
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = csrfProtection.generateToken(req, res);
  next();
});

// ** DEFINING RELATIONS BETWEEN TABLES
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

//**MY ROUTES */
app.use('/admin', adminRoutes.router); // registering the admin routes\
app.use(shopRoutes.router); // registering the shop routes
app.use(authRoutes); // registering the auth routes

// ** REDIRECTION 500
app.get('/500', errorPage.error500);

// ** REDIRECTION 404
app.use((err, req, res, next) => {
  console.log('Error caught:', err);
  errorPage.error500(req, res, next); // Call your controller function
});

// CSRF Error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.log('CSRF Token Error:', err);
    return res
      .status(403)
      .send('Invalid CSRF token. Please refresh the page and try again.');
  }
  next(err);
});

sequelize
  .sync({ force: false })
  .then(() => {
    return sessionStore.sync();
  })
  .then(() => {
    console.log('Session store synced');
    app.listen(3000);
    console.log('Server started on port 3000');
  })
  .catch((err) => {
    console.log(err);
  });

// creating a server that listens on port 3000
