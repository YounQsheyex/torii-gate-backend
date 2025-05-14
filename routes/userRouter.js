const router = require("express").Router();
const {
  handleRegister,
  handleVerifyEmail,
} = require("../controllers/userController");

router.post("/register", handleRegister);
router.post("/verify-email/:token", handleVerifyEmail);

module.exports = router;
