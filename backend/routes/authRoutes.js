const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const OtpVerification = require("../models/OtpVerification");
const { isEmailConfigured, sendOtpEmail, sendPasswordResetEmail } = require("../utils/mailer");

const router = express.Router();

// Strict Email validation helper
const isValidEmail = (email) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email || "").trim());
};

// 10-digit Mobile validation helper
const isValid10DigitPhone = (phone) => {
  const cleaned = String(phone || "").replace(/[\s\-+]/g, "");
  return /^[6-9]\d{9}$/.test(cleaned) || /^\d{10}$/.test(cleaned);
};

// Real Strong Password validator (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character)
const getPasswordRequirementsError = (password) => {
  if (!password || typeof password !== "string") return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters long.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter (A-Z).";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter (a-z).";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number (0-9).";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must contain at least one special symbol (!@#$%^&* etc.).";
  }
  return null;
};

/**
 * GET /api/auth/status
 * Check auth & email configuration status
 */
router.get("/status", (req, res) => {
  res.status(200).json({
    success: true,
    emailConfigured: isEmailConfigured(),
    message: isEmailConfigured()
      ? "Real email service is active & configured"
      : "Email service pending SMTP credentials in .env",
  });
});

/**
 * POST /api/auth/send-otp
 * Generates and sends a 6-digit OTP to the user's email
 */
router.post("/send-otp", async (req, res) => {
  try {
    const { name, email, phone, type = "signup" } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // If phone provided, validate 10-digit phone number
    if (phone && !isValid10DigitPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number.",
      });
    }

    // Check if account already exists for signup
    if (type === "signup") {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
      }
    }

    // Check rate limit / 60-second cooldown
    const existingOtp = await OtpVerification.findOne({
      email: normalizedEmail,
      purpose: type,
    });

    if (existingOtp && existingOtp.lastSentAt) {
      const elapsedSeconds = (Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000;
      if (elapsedSeconds < 60) {
        return res.status(429).json({
          success: false,
          message: "Too many OTP requests. Please wait before trying again.",
          cooldownRemaining: Math.ceil(60 - elapsedSeconds),
        });
      }
    }

    // Cryptographically secure 6-digit OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Send real email via Nodemailer
    const emailResult = await sendOtpEmail({
      toEmail: normalizedEmail,
      userName: name || "FoodFusion User",
      otpCode,
    });

    if (!emailResult.success) {
      return res.status(503).json({
        success: false,
        message: emailResult.error || "Failed to send OTP email. Please verify email server settings.",
      });
    }

    // Store hashed OTP with rate limit tracking
    await OtpVerification.findOneAndUpdate(
      { email: normalizedEmail, purpose: type },
      {
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : "",
        otpHash,
        purpose: type,
        attempts: 0,
        expiresAt,
        lastSentAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sending OTP",
    });
  }
});

/**
 * POST /api/auth/resend-otp
 * Resend OTP with cooldown verification
 */
router.post("/resend-otp", async (req, res) => {
  try {
    const { name, email, phone, type = "signup" } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check cooldown
    const existingOtp = await OtpVerification.findOne({
      email: normalizedEmail,
      purpose: type,
    });

    if (existingOtp && existingOtp.lastSentAt) {
      const elapsedSeconds = (Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000;
      if (elapsedSeconds < 60) {
        return res.status(429).json({
          success: false,
          message: "Too many OTP requests. Please wait before trying again.",
          cooldownRemaining: Math.ceil(60 - elapsedSeconds),
        });
      }
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const emailResult = await sendOtpEmail({
      toEmail: normalizedEmail,
      userName: name || "FoodFusion User",
      otpCode,
    });

    if (!emailResult.success) {
      return res.status(503).json({
        success: false,
        message: emailResult.error || "Failed to resend OTP email.",
      });
    }

    await OtpVerification.findOneAndUpdate(
      { email: normalizedEmail, purpose: type },
      {
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : (existingOtp ? existingOtp.phone : ""),
        otpHash,
        purpose: type,
        attempts: 0,
        expiresAt,
        lastSentAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while resending OTP",
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verifies OTP and completes signup / account creation
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { name, email, password, phone, address, otp, type = "signup" } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanedOtp = String(otp).trim();

    const otpRecord = await OtpVerification.findOne({
      email: normalizedEmail,
      purpose: type,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new code.",
      });
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new code.",
      });
    }

    // Check attempts limit (max 5)
    if (otpRecord.attempts >= 5) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      });
    }

    // Verify OTP hash
    const isOtpValid = await bcrypt.compare(cleanedOtp, otpRecord.otpHash);
    if (!isOtpValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      if (otpRecord.attempts >= 5) {
        await OtpVerification.deleteOne({ _id: otpRecord._id });
        return res.status(429).json({
          success: false,
          message: "Too many attempts. Please request a new OTP.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Incorrect OTP. Please try again.",
        attemptsRemaining: 5 - otpRecord.attempts,
      });
    }

    // OTP is valid -> delete single-use record
    await OtpVerification.deleteOne({ _id: otpRecord._id });

    // Handle signup user creation
    if (type === "signup") {
      if (!name || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email and password are required to complete signup",
        });
      }

      const passwordError = getPasswordRequirementsError(password);
      if (passwordError) {
        return res.status(400).json({
          success: false,
          message: passwordError,
        });
      }

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const isPhoneValid = Boolean(phone && isValid10DigitPhone(phone));

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone ? String(phone).trim() : "",
        address: address ? String(address).trim() : "",
        isEmailVerified: true,
        isPhoneVerified: isPhoneValid,
      });

      const jwtSecret = process.env.JWT_SECRET || "FoodFusion_Super_Secret_Key_2026";
      const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        jwtSecret,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
        },
      });
    }

    // For generic verification
    return res.status(200).json({
      success: true,
      message: "Verification successful",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
    });
  }
});

/**
 * POST /api/auth/register (Direct registration fallback)
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !String(name).trim() || String(name).trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid full name (at least 2 characters).",
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address (e.g. name@example.com).",
      });
    }

    if (phone && !isValid10DigitPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    const passwordError = getPasswordRequirementsError(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists. Please log in or reset your password.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const isPhoneValid = Boolean(phone && isValid10DigitPhone(phone));

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? String(phone).trim() : "",
      address: address ? String(address).trim() : "",
      isEmailVerified: false,
      isPhoneVerified: isPhoneValid,
    });

    const jwtSecret = process.env.JWT_SECRET || "FoodFusion_Super_Secret_Key_2026";
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticates user securely with hashed password comparison
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your password.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please check your credentials or create an account.",
      });
    }

    const passwordMatch = await bcrypt.compare(String(password), user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please check your credentials or use Forgot Password.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "FoodFusion_Super_Secret_Key_2026";
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Generates single-use reset token and emails it to the user
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address. Please check your spelling or sign up.",
      });
    }

    // Generate cryptographically secure random 32-byte reset token
    const rawResetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawResetToken).digest("hex");

    // Token expires in 15 minutes
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/#reset-password?token=${rawResetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    let emailSent = false;
    if (isEmailConfigured()) {
      const emailResult = await sendPasswordResetEmail({
        toEmail: normalizedEmail,
        userName: user.name,
        resetToken: rawResetToken,
        resetUrl,
      });
      emailSent = emailResult.success;
    }

    return res.status(200).json({
      success: true,
      message: emailSent
        ? "Password reset link sent to your email."
        : "Password reset code generated successfully.",
      resetToken: rawResetToken,
      resetUrl,
      emailConfigured: isEmailConfigured(),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset request",
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Verifies reset token and updates password
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !String(token).trim()) {
      return res.status(400).json({
        success: false,
        message: "Reset token/code is required.",
      });
    }

    const passwordError = getPasswordRequirementsError(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(String(token).trim()).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset code has expired or is invalid. Please request a new password reset.",
      });
    }

    // Hash new password
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully! You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
});

module.exports = router;