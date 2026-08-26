const nodemailer = require("nodemailer");

/**
 * Creates and returns a Nodemailer transporter configured from environment variables.
 */
function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  // Custom SMTP Host/Port if provided
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: { user, pass },
    });
  }

  // Default to standard service (e.g. Gmail) if host is not specified
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: { user, pass },
  });
}

/**
 * Checks if real email delivery is properly configured.
 */
function isEmailConfigured() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD;
  return Boolean(user && pass && user !== "your_email@gmail.com");
}

/**
 * Sends a 6-digit OTP verification email.
 *
 * @param {Object} options
 * @param {string} options.toEmail - Recipient email address
 * @param {string} [options.userName] - Recipient name
 * @param {string} options.otpCode - The 6-digit verification code
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendOtpEmail({ toEmail, userName, otpCode }) {
  if (!isEmailConfigured()) {
    return {
      success: false,
      error:
        "Email delivery service is not configured on the server. Please set EMAIL_USER and EMAIL_APP_PASSWORD in backend/.env to send real OTP emails.",
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      error: "Failed to initialize email transporter.",
    };
  }

  const sender = process.env.EMAIL_FROM || `FoodFusion <${process.env.EMAIL_USER}>`;
  const nameGreeting = userName ? `Hello ${userName},` : "Hello,";

  const mailOptions = {
    from: sender,
    to: toEmail,
    subject: `🔐 Your FoodFusion Verification Code: ${otpCode}`,
    text: `${nameGreeting}\n\nYour 6-digit FoodFusion verification code is: ${otpCode}\n\nThis code will expire in 10 minutes. Do not share this code with anyone.\n\nThank you,\nFoodFusion Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #ff5722; margin: 0; font-size: 24px;">🍱 FoodFusion</h2>
          <p style="color: #666; font-size: 14px; margin-top: 4px;">Gourmet Food Ordering Platform</p>
        </div>
        <p style="color: #333; font-size: 16px;">${nameGreeting}</p>
        <p style="color: #555; font-size: 15px; line-height: 1.5;">
          Thank you for signing up with FoodFusion. Please use the verification code below to verify your account:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: #fff5f0; border: 2px dashed #ff5722; border-radius: 10px; padding: 14px 28px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ff5722;">${otpCode}</span>
          </div>
        </div>
        <p style="color: #777; font-size: 13px; line-height: 1.4;">
          ⏱️ This code is valid for <strong>10 minutes</strong>. For your security, never share this code with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          If you did not request this verification code, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Nodemailer OTP sending error:", err.message);
    return {
      success: false,
      error: `Failed to deliver email: ${err.message}`,
    };
  }
}

/**
 * Sends a Password Reset Link email.
 *
 * @param {Object} options
 * @param {string} options.toEmail - Recipient email address
 * @param {string} [options.userName] - Recipient name
 * @param {string} options.resetToken - Raw single-use reset token
 * @param {string} options.resetUrl - Full URL to password reset form
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendPasswordResetEmail({ toEmail, userName, resetToken, resetUrl }) {
  if (!isEmailConfigured()) {
    return {
      success: false,
      error:
        "Email delivery service is not configured on the server. Please set EMAIL_USER and EMAIL_APP_PASSWORD in backend/.env to send password reset emails.",
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      error: "Failed to initialize email transporter.",
    };
  }

  const sender = process.env.EMAIL_FROM || `FoodFusion <${process.env.EMAIL_USER}>`;
  const nameGreeting = userName ? `Hello ${userName},` : "Hello,";

  const mailOptions = {
    from: sender,
    to: toEmail,
    subject: "🔑 FoodFusion Password Reset Request",
    text: `${nameGreeting}\n\nYou requested to reset your password for your FoodFusion account.\n\nReset Code / Token: ${resetToken}\n\nOr open this link in your browser to set a new password:\n${resetUrl}\n\nThis reset token will expire in 15 minutes. If you did not request a password reset, please ignore this email.\n\nThank you,\nFoodFusion Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #ff5722; margin: 0; font-size: 24px;">🍱 FoodFusion</h2>
          <p style="color: #666; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
        </div>
        <p style="color: #333; font-size: 16px;">${nameGreeting}</p>
        <p style="color: #555; font-size: 15px; line-height: 1.5;">
          We received a request to reset your FoodFusion account password. You can reset your password by using the reset code below or by clicking the button:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #ff5722; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
            Reset My Password
          </a>
        </div>
        <div style="text-align: center; margin: 16px 0;">
          <p style="color: #777; font-size: 13px; margin-bottom: 6px;">Or enter this Reset Token manually:</p>
          <code style="background: #f4f4f4; padding: 8px 14px; border-radius: 6px; font-size: 14px; color: #333; word-break: break-all; display: inline-block;">${resetToken}</code>
        </div>
        <p style="color: #777; font-size: 13px; line-height: 1.4;">
          ⏱️ This reset link/token will expire in <strong>15 minutes</strong>. If you did not make this request, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          FoodFusion Security Team
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Nodemailer Password Reset sending error:", err.message);
    return {
      success: false,
      error: `Failed to deliver email: ${err.message}`,
    };
  }
}

module.exports = {
  isEmailConfigured,
  sendOtpEmail,
  sendPasswordResetEmail,
};
