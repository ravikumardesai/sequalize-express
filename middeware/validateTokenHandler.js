require("dotenv").config();
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESSTOKEN_SECRET, (err, decode) => {
      if (err) {
        res.status(401).json({
          success: false,
          message: "user not authorised",
        });
      }
      req.user = decode.user;
      next();
    });
    if (!token) {
      res.status(401).json({
        success: false,
        message: "User is Not authorized or token is missing in the rquest",
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "user not authorised",
    });
  }
});
module.exports = validateToken;
