const router = require("express").Router();
const {
  handleRegister,
  handleVerifyEmail,
  handleLogin,
} = require("../controllers/userController");

router.post("/register", handleRegister);
router.post("/verify-email/:token", handleVerifyEmail);
router.post("/login", handleLogin);

module.exports = router;
