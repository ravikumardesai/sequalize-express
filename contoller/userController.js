require("dotenv").config();
const asyncHandler = require("express-async-handler");
const nodeMailer = require("nodemailer");
const Customer = require("../models/customerModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Otp = require("../models/otpModel");

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

// @desc for forget password
// @method POST /api/forgot-password
// @access public
const userForgetPassword = asyncHandler(async (req, res) => {
  requestForOtp(req, res);
});

// @desc for resnd the otp
// @method POST /api/resend-otp
// @access public
const userResendOtp = asyncHandler(async (req, res) => {
  requestForOtp(req, res);
});

// @desc for verify the otp
// @method POST /api/verify-otp
// @access public
const varifyOtp = asyncHandler(async (req, res) => {
  const { mail, otp } = req.body;

  if (!mail || !otp) {
    res.status(400).json({
      success: false,
      message: "Please provide otp and/or email",
    });
  }

  // const user = await Customer.findOne({ where: { email: email } });
  // if (user && (await bcrypt.compare(password, user.password))) {

  const verify = await Otp.findOne({
    where: {
      mail: mail,
    },
  });

  // console.log(verify.otp , otp);
  // console.log(verify && (await bcrypt.compare(otp, verify.otp)));
  if (verify && (await bcrypt.compare(otp, verify.otp))) {
    if (verify.expire_at < new Date()) {
      await Otp.destroy({
        where: { mail: mail },
      }).then(() => {
        res.status(400).json({
          success: false,
          message: "otp expired, generate new one",
        });
      });
    } else {
      // create access token for secure new password route
      const accessToken = jwt.sign(
        {
          user: {
            email: verify.mail,
          },
        },
        process.env.ACCESSTOKEN_SECRET,
        {
          expiresIn: "1000m",
        }
      );

      await Otp.destroy({
        where: { mail: mail },
      }).then(() => {
        res.status(200).json({
          success: true,
          message: "otp verified",
          token: accessToken,
        });
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "otp verification failed",
    });
  }
});

// @desc for creating new password
// @method POST /api/new-password
// @access private
const createNewPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(401).json({
      success: false,
      message: "Please Provide Password",
    });
  }
  const customer = await Customer.findOne({
    where: {
      email: req.user.email,
    },
  });
  if (!customer) {
    res.status(404).json({
      success: false,
      message: "user not found",
    });
  } else {
    customer.password = bcrypt.hashSync(password, 10);
    await customer.save().then(() => {
      res.status(200).json({
        success: true,
        message: "password updated",
      });
    });
  }
});

// @desc for updating profile
// @method POST /api/profile
// @access private
const userProfileUpload = asyncHandler(async (req, res) => {
  // console.log("------file",req.file);
  const customer = await Customer.findOne({
    where: {
      email: req.user.email,
    },
  });

  if (!customer) {
    res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  } else {
    customer.profile = req.file.path;
    await customer.save().then(() => {
      res.status(200).json({
        success: true,
        message: "profile uploaded",
      });
    });
  }
});

// @desc for getting current user details
// @method GET /api/current-user
// @access private
const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = await Customer.findOne({
    where: { email: req.user.email },
  });
  if (!currentUser) {
    res.status(404).json({
      success: false,
      message: "User Not found",
    });
  }

  res.json({
    success: true,
    message: "Getting record",
    data: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      profile:currentUser.profile ? req.headers.host + "/" + currentUser.profile : null,
    },
  });
});

// ---------------------------------------------------
// extended usefull methods
// use for generating otp
const generateOtp = (num) => {
  let otp = "";
  for (let index = 0; index < num; index++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
};

// use for send otp / resend otp
const requestForOtp = async (req, res) => {
  // get mail and validate
  const { mail } = req.body;
  if (!mail) {
    res.status(401).json({
      success: false,
      message: "Please provide email",
    });
  }

  // search mail in users
  const isEmail = await Customer.findOne({ where: { email: mail } });

  if (!isEmail) {
    res.status(404).json({
      success: false,
      message: `provided email not found`,
    });
  }

  // generate otp
  const otp = generateOtp(6);

  // remove after production
  console.log(otp);

  const hashedOtp = bcrypt.hashSync(otp, 10);

  // insert or update otp
  await Otp.findOne({ where: { mail: mail } })
    .then((obj) => {
      obj
        ? obj.update({
            otp: hashedOtp,
            mail,
            expire_at: new Date(Date.now() + 1 * (60 * 60 * 1000)),
          })
        : Otp.create({
            otp: hashedOtp,
            mail,
            expire_at: new Date(Date.now() + 1 * (60 * 60 * 1000)),
          });
    })
    .then(() => {
      //sending mail

      const transporter = nodeMailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.mail_username, // generated ethereal user
          pass: process.env.MAIL_PASSWORD, // generated ethereal password
        },
      });

      const mailOptions = {
        from: "ravi.prismetric@gmail.com",
        to: mail,
        subject: "Reset Password",
        text: "your otp is :" + otp,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.status(500).json({
            success: false,
            message: `otp verification failed`,
          });
        } else {
          res.status(200).json({
            success: true,
            message: `otp send for ${mail}`,
          });
        }
      });
      // end sending mail
    });
};

module.exports = {
  loginUser,
  registerUser,
  userForgetPassword,
  varifyOtp,
  userResendOtp,
  createNewPassword,

  userProfileUpload,

  getCurrentUser,
};
