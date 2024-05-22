// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
});

const Client = sequelize.define('Client', {
  clientName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  treatmentPlan: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  intakeNote: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  sessionNote: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  timestamps: false,
});

module.exports = { sequelize, Client };
