const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const passport = require("passport");
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
      isEmailVerified: false,
      isPhoneVerified: isPhoneValid,
    });

    const jwtSecret = process.env.JWT_SECRET || "FoodFusion_Super_Secret_Key_2026";
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      jwtSecret,
      { expiresIn: "7d" }
    );

    if (req.session) {
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        googleId: user.googleId || null,
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

    // 1. If email doesn't exist -> return "Incorrect email or password"
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // If user signed up via Google with no password set yet
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "This account was created via Google. Please click 'Forgot Password' to sign in with Google.",
      });
    }

    // 2. If password doesn't match -> return "Incorrect password"
    const passwordMatch = await bcrypt.compare(String(password), user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // 3. If correct -> create JWT & session and log the user in
    const jwtSecret = process.env.JWT_SECRET || "FoodFusion_Super_Secret_Key_2026";
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      jwtSecret,
      { expiresIn: "7d" }
    );

    if (req.session) {
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        googleId: user.googleId || null,
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
 * GET /api/auth/google
 * Initiates Google OAuth Login (used for Forgot Password & Google Sign-In)
 */
/**
 * POST /api/auth/google
 * Verifies Google Identity Services ID token (Credential Response from popup/One-Tap)
 */
router.post("/google", async (req, res) => {
  try {
    const { credential, idToken } = req.body;
    const tokenToVerify = credential || idToken;

    if (!tokenToVerify) {
      return res.status(400).json({
        success: false,
        message: "Google credential / ID token is required",
      });
    }

    // Verify token with Google API
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
      tokenToVerify
    )}`;

    const googleRes = await fetch(googleVerifyUrl);
    if (!googleRes.ok) {
      const errData = await googleRes.json().catch(() => ({}));
      return res.status(401).json({
        success: false,
        message: errData.error_description || "Invalid Google ID token",
      });
    }

    const payload = await googleRes.json();
    const email = payload.email ? payload.email.toLowerCase().trim() : null;
    const googleId = payload.sub;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account does not have a verified email address",
      });
    }

    // Optional client ID check if configured
    if (
      process.env.GOOGLE_CLIENT_ID &&
      payload.aud &&
      payload.aud !== process.env.GOOGLE_CLIENT_ID
    ) {
      console.warn("Google token audience mismatch:", payload.aud, process.env.GOOGLE_CLIENT_ID);
    }

    let user = await User.findOne({ email });

    if (user) {
      let modified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        modified = true;
      }
      if (payload.picture && !user.avatar) {
        user.avatar = payload.picture;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      const displayName =
        payload.name ||
        (payload.given_name
          ? `${payload.given_name} ${payload.family_name || ""}`.trim()
          : "Google User");

      user = await User.create({
        name: displayName,
        email: email,
        googleId: googleId,
        avatar: payload.picture || "",
        isEmailVerified: true,
        isPhoneVerified: false,
      });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || "FoodFusion_Super_Secret_Key_2026";
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      jwtSecret,
      { expiresIn: "7d" }
    );

    if (req.session) {
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      googleId: user.googleId || null,
      phone: user.phone || "",
      address: user.address || "",
      isEmailVerified: user.isEmailVerified,
    };

    return res.status(200).json({
      success: true,
      message: `Welcome, ${user.name}!`,
      token,
      user: userPayload,
    });
  } catch (err) {
    console.error("Google token verification error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during Google authentication",
    });
  }
});

/**
 * GET /api/auth/google
 * Initiates Google OAuth Login (used for Forgot Password & Google Sign-In redirect/popup fallback)
 */
router.get("/google", (req, res, next) => {
  const returnTo =
    req.query.returnTo ||
    req.headers.referer ||
    process.env.FRONTEND_URL ||
    "https://momsfood-fusion.netlify.app";

  if (req.session) {
    req.session.returnTo = String(returnTo).replace(/\/$/, "");
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    const frontendUrl =
      (req.session && req.session.returnTo) ||
      process.env.FRONTEND_URL ||
      "https://momsfood-fusion.netlify.app";
    return res.redirect(
      `${frontendUrl}/#auth-error?message=${encodeURIComponent(
        "Google OAuth credentials (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET) are missing from backend/.env. Please configure them to enable Google Sign-In."
      )}`
    );
  }

  // Pass returnTo via state parameter if session cookies are cross-site
  const state = req.query.returnTo ? Buffer.from(String(req.query.returnTo)).toString("base64") : "";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    state: state || undefined,
  })(req, res, next);
});

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth Callback, links account if email exists, creates JWT & session, and redirects/bridges to frontend
 */
router.get(
  "/google/callback",
  (req, res, next) => {
    let returnTo = (req.session && req.session.returnTo) || process.env.FRONTEND_URL || "https://momsfood-fusion.netlify.app";
    if (req.query.state) {
      try {
        const decoded = Buffer.from(req.query.state, "base64").toString("utf8");
        if (decoded.startsWith("http")) returnTo = decoded.replace(/\/$/, "");
      } catch (e) {}
    }
    passport.authenticate("google", {
      failureRedirect: `${returnTo}/#auth-error?message=Google%20Authentication%20Failed`,
    })(req, res, next);
  },
  async (req, res) => {
    let frontendUrl = (req.session && req.session.returnTo) || process.env.FRONTEND_URL || "https://momsfood-fusion.netlify.app";
    if (req.query.state) {
      try {
        const decoded = Buffer.from(req.query.state, "base64").toString("utf8");
        if (decoded.startsWith("http")) frontendUrl = decoded.replace(/\/$/, "");
      } catch (e) {}
    }

    try {
      const user = req.user;
      if (!user) {
        return res.redirect(`${frontendUrl}/#auth-error?message=User%20not%20found`);
      }

      // Generate JWT
      const jwtSecret = process.env.JWT_SECRET || "FoodFusion_Super_Secret_Key_2026";
      const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        jwtSecret,
        { expiresIn: "7d" }
      );

      // Set session user
      if (req.session) {
        req.session.user = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }

      const userPayload = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        googleId: user.googleId || null,
        phone: user.phone || "",
        address: user.address || "",
        isEmailVerified: user.isEmailVerified,
      };

      const redirectTarget = `${frontendUrl}/#google-auth-success?token=${token}&user=${encodeURIComponent(
        JSON.stringify(userPayload)
      )}`;

      // Return a robust HTML bridge that communicates with window.opener if opened in popup, or redirects
      return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FoodFusion — Authenticating with Google...</title>
  <style>
    body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; background: #0c0d12; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .loader { width: 48px; height: 48px; border: 4px solid rgba(255,107,0,0.2); border-top-color: #ff6b00; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    h2 { margin: 0 0 10px; font-size: 1.4rem; font-weight: 700; color: #ff6b00; }
    p { color: #a1a1aa; font-size: 0.95rem; }
  </style>
</head>
<body>
  <div class="loader"></div>
  <h2>Signed In Successfully!</h2>
  <p>Connecting your Google account to FoodFusion...</p>
  <script>
    (function() {
      var authData = {
        type: 'GOOGLE_AUTH_SUCCESS',
        token: ${JSON.stringify(token)},
        user: ${JSON.stringify(userPayload)}
      };
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage(authData, '*');
          setTimeout(function() { window.close(); }, 400);
          return;
        } catch(e) {
          console.error("Popup postMessage error:", e);
        }
      }
      window.location.href = ${JSON.stringify(redirectTarget)};
    })();
  </script>
</body>
</html>`);
    } catch (err) {
      console.error("Google callback handling error:", err);
      return res.redirect(`${frontendUrl}/#auth-error?message=Server%20error%20during%20Google%20login`);
    }
  }
);

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

    const frontendUrl = process.env.FRONTEND_URL || "https://momsfood-fusion.netlify.app";
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