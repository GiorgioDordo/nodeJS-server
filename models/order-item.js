const Sequelize = require('sequelize');
const sequelize = require('../utility/database.js');

const OrderItem = sequelize.define('orderItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: {
    type: Sequelize.INTEGER,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  image: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  productId: {
    type: Sequelize.INTEGER,
    allowNull: true, // Allowing  NULL
    references: {
      model: 'products',
      key: 'id',
    },
    onDelete: 'SET NULL', // Setting to NULL instead of CASCADE
  },
});

module.exports = OrderItem;
