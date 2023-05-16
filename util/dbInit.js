const Customer = require("../models/customerModel");
const Order = require("../models/ordersModel");
const Otp = require("../models/otpModel")
const sequelize = require("./database");
// relations
Customer.hasMany(Order);
Order.belongsTo(Customer)
const connectDb = () => {
  sequelize
      // .sync({ force: true })
    .sync()
    .then((res) => {
      console.log("Connected");
    })
    .catch((e) => console.log("error", e));
};

module.exports = connectDb;