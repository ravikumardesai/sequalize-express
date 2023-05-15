const asyncHandler = require("express-async-handler");
const Customer = require("../models/customerModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// @desc for login user
// @method POST /api/login
// @access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "All fields are mandetory",
    });
  }

  const user = await Customer.findOne({ where: { email: email } });
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          name: user.name,
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESSTOKEN_SECRET,
      {
        expiresIn: "1000m",
      }
    );
    res.status(200).json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email },
      token: accessToken,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "email or password is wrong",
    });
  }
});

// @desc for register user
// @method POST /api/register
// @access public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      message: "All fields are mandetory",
    });
  }
  const validateEmail = await Customer.findOne({ where: { email: email } });
  if (validateEmail) {
    res.status(401).json({
      success: false,
      message: "email already exist",
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const customer = await Customer.create({
    name,
    email,
    password: hashedPassword,
  });

  const accessToken = jwt.sign(
    {
      user: {
        name: customer.name,
        email: customer.email,
        id: customer.id,
      },
    },
    process.env.ACCESSTOKEN_SECRET,
    {
      expiresIn: "1000m",
    }
  );

  res.status(201).json({
    success: true,
    data: customer,
    token: accessToken,
  });
});

module.exports = { loginUser, registerUser };
