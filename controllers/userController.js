const USER = require("../models/user");
const bcrypt = require("bcryptjs");
const generateToken = require("../helpers/generateToken");
const { sendWelcomeEmail, sendResetEmail } = require("../emails/sendEmail");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

const handleRegister = async (req, res) => {
  const { fullName, email, password, phoneNumber, role } = req.body;
  try {
    //check if user exists (email and phoneNumber)
    //$or
    const existingUser = await USER.findOne({
      $or: [{ email: email || null }, { phoneNumber: phoneNumber || null }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or Phone number already exists" });
    }
    // protect users password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    //verify process
    const verificationToken = generateToken();
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    //save to db
    const user = await USER.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || "tenant",
      phoneNumber,
      verificationToken,
      verificationTokenExpires,
    });
    //send an email
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
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const handleVerifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    ///1. find user by token
    const user = await USER.findOne({
      verificationToken: token,
    });
    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }
    //2. check if token has expired
    if (user.verificationTokenExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "verification token has expired", email: user.email });
    }
    //3. check if user is already verifief
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    //mark the user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email Verified Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// handleLogin

const handleLogin = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Email, password, and role are required" });
  }
  try {
    const user = await USER.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Account Not found, Please Register" });
    }
    if (user.role !== role) {
      return res.status(403).json({ message: "Access Denied for this role" });
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Email Not verified, Check your mail" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or Password" });
    }
    // generate a token  (validity , period )
    const token = jwt.sign(
      { email: user.email, role: user.role, userId: user._id },
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
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error(error);
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
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // generate a new token and expiration
    const newToken = generateToken();
    const tokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hrs

    user.verificationToken = newToken;
    user.verificationTokenExpires = tokenExpires;
    await user.save();

    const clientUrl = `${process.env.FRONTEND_URL}/verify-email/${newToken}`;

    await sendWelcomeEmail({
      email: user.email,
      fullName: user.fullName,
      clientUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
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
      return res.status(404).json({ message: "User not found" });
    }
    const token = generateToken();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1hr
    await user.save();

    //send the mail
    const clientUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendResetEmail({
      fullName: user.fullName,
      email: user.email,
      clientUrl,
    });

    res.status(200).json({
      success: true,
      token,
      message: "Password reset link sent to your mail",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const handleResetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400), json({ message: "Provide token and new password" });
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
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const handleGetUser = async (req, res) => {
  const { userId } = req.user;
  try {
    const user = await USER.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const handleUpdateUser = async (req, res) => {
  const { fullName, phoneNumber } = req.body;
  const { userId } = req.user;
  if (!fullName || !phoneNumber) {
    return res
      .status(400)
      .json({ message: "Provide fullName and phone number" });
  }
  try {
    const user = await USER.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    // upload image with cloudinary
    if (req.files && req.files.profilePicture) {
      const profilePicture = req.files.profilePicture;
      const result = await cloudinary.uploader.upload(
        profilePicture.tempFilePath,
        {
          folder: "toriigate/profilePictures",
          use_filename: true,
          unique_filename: false,
        }
      );
      user.profilePicture = result.secure_url;
    }
    user.fullName = fullName;
    user.phoneNumber = phoneNumber;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "User Updated successfully", user });
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
  handleUpdateUser,
  handleGetUser,
};
