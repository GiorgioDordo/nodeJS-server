// importing the http module that we need to create a server
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { doubleCsrf: csrf } = require('csrf-csrf');

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

const app = express();

const sessionStore = new SequelizeStore({
  db: sequelize,
});

const csrfProtection = csrf({
  getSecret: () => 'supersecret',
  getTokenFromRequest: (req) => req.body._csrf,
  // __HOST and __SECURE are blocked in chrome, change name
  cookieName: '__APP-psfi.x-csrf-token',
});

app.set('view engine', 'ejs'); // setting the template engine
app.set('views', 'views'); // setting the views directory

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'my secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(cookieParser('supersecret'));
app.use(csrfProtection.doubleCsrfProtection);

app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('=== DETAILED CSRF DEBUG ===');
    console.log('Session ID:', req.sessionID);
    console.log('Body token:', req.body._csrf);
    console.log('Cookies:', req.cookies); // Should not be undefined now
    console.log(
      'CSRF Cookie:',
      req.cookies && req.cookies['__APP-psfi.x-csrf-token']
    );
  }
  next();
});

app.use((req, res, next) => {
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Session exists:', !!req.session);
  console.log('Session.user exists:', !!req.session.user);
  console.log('Session.user value:', req.session.user);
  console.log('Session.isLoggedIn:', req.session.isLoggedIn);
  if (!req.session.user) {
    return next();
  }

  // Fetch fresh user from database to get Sequelize methods
  User.findByPk(req.session.user.id)
    .then((user) => {
      req.session.user = user; // Replace the plain object with Sequelize instance
      next();
    })
    .catch((err) => {
      console.log(err);
      next();
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
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

// ** REDIRECTION 404
app.use(errorPage.error404);

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
