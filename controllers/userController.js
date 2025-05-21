const USER = require("../models/user");
const bcrypt = require("bcryptjs");
const generateToken = require("../helpers/generateToken");
const { sendWelcomeEmail, sendResetEmail } = require("../emails/sendEmail");
const jwt = require("jsonwebtoken");
// handleRegister
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
    const verificationToken = generateToken();
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 100; //24 hours
    // create db
    const user = await USER.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: role || "tenant",
      verificationToken,
      verificationTokenExpires,
    });
    // send email
    const clientUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendWelcomeEmail({
      email: user.email,
      fullName: user.fullName,
      clientUrl,
    });
    return res
      .status(201)
      .json({ success: true, message: "User Registered successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// handleVerify email
const handleVerifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    // 1 find user by token
    const user = await USER.findOne({
      verificationToken: token,
    });
    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }
    // check if token has expired
    if (user.verificationTokenExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Verification token has expired", email: user.email });
    }
    // check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "email is already verified" });
    }
    // mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Email Verified Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// handleLogin
const handleLogin = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Email, Password and role are Required" });
  }
  try {
    const user = await USER.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Account not Found, Please Register" });
    }
    if (user.role !== role) {
      return res.status(401).json({ message: "Access Denied for this role" });
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Email is not verified, Check your mail" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or Password" });
    }
    // generating token
    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3 days" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
};

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    //generate token again
    const newToken = generateToken();
    const tokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    user.verificationToken = newToken;
    user.verificationTokenExpires = tokenExpires;
    await user.save();
    //Send an email
    const clientUrl = ` ${process.env.FRONTEND_URL}/verify-email/${newToken}`;
    await sendWelcomeEmail({
      email: user.email,
      fullName: user.fullName,
      clientUrl,
    });

    return res
      .status(201)
      .json({ success: true, message: "Verification Email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const handleForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const token = generateToken();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; //1hour
    await user.save();

    // send email
    const clientUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendResetEmail({
      fullName: user.fullName,
      email: user.email,
      clientUrl,
    });

    res.status(200).json({
      success: true,
      token,
      message: "Password Reset link is sent to your email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const handleResetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: "Provide token and new password" });
  }
  try {
    const user = await USER.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid or expired link, try again" });
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "password Reset Sucessfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handleRegister,
  handleVerifyEmail,
  handleLogin,
  resendVerificationEmail,
  handleForgotPassword,
  handleResetPassword,
};
