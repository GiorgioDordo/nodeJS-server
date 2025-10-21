// importing the http module that we need to create a server
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

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

app.set('view engine', 'ejs'); // setting the template engine
app.set('views', 'views'); // setting the views directory

const sessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(
  session({
    secret: 'your-secret-key-here',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

// app.use(
//   session({
//     secret: 'my secret',
//     resave: false,
//     saveUninitialized: false,
//   })
// ); // setting up session management

// urlencoded register a middleware like the one we created below and add next() to it so that the request can continue to the next middleware and it also parses the incoming request body and makes it available under req.body
// it can't parse json data, for that we need to use bodyParser.json() and it can't parse files, for that we need to use multer package
app.use(bodyParser.urlencoded({ extended: false })); // I should pass the config options as an object and set extended to false so that I can only parse simple data types like strings and arrays

app.use(express.static(path.join(__dirname, 'public'))); // serving static files like css, images, js files

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
  .then((result) => {
    console.log('result avvio', result);
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: 'Dummy', email: 'test@dummy.com' });
    }

    return user; // Add this return!
  })
  .then((user) => {
    console.log('Avvio user', user);
    console.log('User methods:', Object.getOwnPropertyNames(user.__proto__));
    return user.getCart().then((cart) => {
      if (cart) {
        return cart;
      }
      return user.createCart();
    });
  })
  .then((cart) => {
    console.log(cart);
    console.log('Cart methods:', Object.getOwnPropertyNames(cart.__proto__));
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
