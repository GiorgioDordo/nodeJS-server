require('dotenv').config();

// 1. Core Modules
const path = require('path');

// 2. Third-Party Modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { doubleCsrf: csrf } = require('csrf-csrf');
const flash = require('@codecorn/connect-flash-new');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// 3. Local Imports (Database, Models, Controllers)
const sequelize = require('./utility/database.js');
const errorPage = require('./controllers/404.js');

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Models
const Product = require('./models/product.js');
const User = require('./models/user.js');
const Cart = require('./models/cart.js');
const CartItem = require('./models/cart-item.js');
const Order = require('./models/order.js');
const OrderItem = require('./models/order-item.js');

const app = express();

// --- CONFIGURATION START ---

const sessionStore = new SequelizeStore({
  db: sequelize,
});

const csrfProtection = csrf({
  getSecret: () => 'supersecret',
  // Safe access using ?. to prevent crash if body is undefined
  getTokenFromRequest: (req) =>
    req.body?.csrfToken ||
    req.headers['csrf-token'] ||
    req.headers['x-csrf-token'],
  cookieName: '__APP-psfi.x-csrf-token',
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

// --- MIDDLEWARE PIPELINE START ---

// 1. Static Files (Should come early so they don't trigger DB lookups)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// 2. Parsers (Body & File)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));

// 3. Session & Cookies
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);
app.use(cookieParser('supersecret'));

// 4. Security (CSRF) - Must come after cookie/body parsers
app.use(csrfProtection.doubleCsrfProtection);

// 5. Flash Messages
app.use(flash());

// 6. Debugging Middleware (Optional)
app.use((req, res, next) => {
  // Only logging strictly necessary info to keep console clean
  if (req.method === 'POST') {
    // console.log('=== POST DEBUG: CSRF Token Check ===');
    // console.log('Body:', req.body.csrfToken);
  }
  next();
});

// 7. User Hydration (Find User from Session)
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.session.user = user;
      next();
    })
    .catch((err) => {
      // Create a specific error object to pass to next()
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
});

// 8. Local Variables (Available in every view)
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = csrfProtection.generateToken(req, res);
  next();
});

// --- ROUTES START ---

app.use('/admin', adminRoutes.router);
app.use(shopRoutes.router);
app.use(authRoutes);

app.get('/500', errorPage.error500);

// --- ERROR HANDLING START ---

// 1. 404 Handler (Catches pages not found)
// Note: You need to make sure errorPage.error404 exists and is exported in your controller
app.use(errorPage.error404);

// 2. CSRF Error Handler (Specific)
// This must come BEFORE the generic error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.log('CSRF Token Error Handled');
    return res
      .status(403)
      .send('Invalid CSRF token. Please refresh the page and try again.');
  }
  next(err);
});

// 3. Global 500 Error Handler (Generic)
app.use((err, req, res, next) => {
  console.log('Global Error Caught:', err);
  errorPage.error500(req, res, next);
});

// --- DATABASE SYNC & SERVER START ---

// Define Relations
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem, constraints: false });
Product.belongsToMany(Order, { through: OrderItem, constraints: false });

// Sync and Listen
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
