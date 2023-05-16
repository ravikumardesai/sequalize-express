const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Customer = sequelize.define(
  "customers",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "Email address already in use!",
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profile:{
      type:Sequelize.STRING,
      allowNull:true
    }
  },
  {
    defaultScope: {
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    },
  }
);

module.exports = Customer;
