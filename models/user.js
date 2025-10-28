const Sequelize = require('sequelize');

const sequelize = require('../utility/database.js');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  resetToken: {
    type: Sequelize.STRING,
  },
  resetTokenExpiration: {
    type: Sequelize.DATE,
  },
});

module.exports = User;
