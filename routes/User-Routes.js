const express = require("express");
const router = express.Router();
const userController = require("../controllers/User-Controllers.js");
const { verify } = require("../auth.js");

// User Registration
router.post("/register", userController.registerUser);

// User Login
router.post("/login", userController.loginUser);

// Check if email exists
router.post("/check-email", userController.checkEmail);

// Get user details
router.post("/details", verify, userController.getProfile);

// Update user password
router.put("/update-password", verify, userController.updatePassword);

module.exports = router;
