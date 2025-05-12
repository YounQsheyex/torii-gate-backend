const USER = require("../models/user");
const bcrypt = require("bcryptjs");

const handleRegister = async (req, res) => {
  const { fullName, email, phoneNumber, password, role } = req.body;
  try {
    // check if user exists (email and phoneNumber)
    const existingUser = await USER.findOne({
      $or: [{ email: email || null }, { phoneNumber: phoneNumber || null }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or Phone number already exist" });
    }
    // protect user password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    // Verify Process
    // create db
    const user = await USER.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: role || "tenant",
    });
    return res
      .status(201)
      .json({ success: true, message: "User Registered successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = { handleRegister };
