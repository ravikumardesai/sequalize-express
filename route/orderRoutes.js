const express = require("express");
const { getOrders,getOrder,createOrder } = require("../contoller/orderController");
const validateToken = require("../middeware/validateTokenHandler");
const router = express.Router();


router.use(validateToken)

router.route("/").get(getOrders).post(createOrder)

router.route("/:id").get(getOrder)


module.exports = router;