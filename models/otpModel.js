const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Otp = sequelize.define("otp", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  otp: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  mail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  expire_at: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

module.exports = Otp;
