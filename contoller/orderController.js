const asyncHandler = require("express-async-handler");
const Order = require("../models/ordersModel");
const Customer = require("../models/customerModel");
// @desc for getting all orders
// @method GET /api/orders
// @access public
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll(
    { where: { customerId: req.user.id } },
    {
      include: Customer,
    }
  );
  if (!orders) {
    res.status(404).json({
      success: false,
      message: "data not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Getting records",
    data: orders,
  });
});

// @desc for getting one order
// @method GET /api/orders/:id
// @access public
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    where: {
      id: req.params.id,
      customerId: req.user.id,
    },
  });
  if (!order) {
    res.status(404).json({
      success: false,
      message: "Not found",
    });
  }
  res.status(200).json({
    success: true,
    message: `geting order datails`,
    data: order,
  });
});

// @desc for creating order
// @method POST /api/orders
// @access public
const createOrder = asyncHandler(async (req, res) => {
  const { orderName, price } = req.body;
  const user = req.user;
  if (!orderName || !price) {
    res.status(400).json({
      success: false,
      message: "All fields are mandetory",
    });
  }
  const order = await Order.create({
    orderName,
    price,
    customerId: user.id,
  });
  res.json({ message: order });
});

module.exports = { getOrders, getOrder, createOrder };
