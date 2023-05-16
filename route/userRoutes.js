const express = require("express");
const validateToken = require("../middeware/validateTokenHandler");
const {
  loginUser,
  registerUser,
  userForgetPassword,
  varifyOtp,
  userResendOtp,
  createNewPassword,
  userProfileUpload,
  getCurrentUser,
} = require("../contoller/userController");
const router = express.Router();

// for file upload - fileupload start

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/profiles");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

// fileupload end

router.post("/login", loginUser);

router.post("/register", registerUser);

router.post("/forgot-password", userForgetPassword);

router.post("/verify-otp", varifyOtp);

router.post("/resend-otp", userResendOtp);

router.put("/new-password", validateToken, createNewPassword);

router.post(
  "/profile",
  validateToken,
  upload.single("profile"),
  userProfileUpload,
  (err, req, res, next) => {
    res.status(400).send({
      success: false,
      message: err.message,
    });
  }
);


router.get("/current-user",validateToken,getCurrentUser)

module.exports = router;
