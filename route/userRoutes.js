const express = require("express");
const router = express.Router();

const { loginUser, registerUser } = require("../contoller/userController");

router.post("/login", loginUser);

router.post("/register", registerUser);

module.exports = router;
