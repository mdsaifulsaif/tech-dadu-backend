"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (user && pass) {
        if (host && host.includes("gmail.com")) {
            return nodemailer_1.default.createTransport({
                service: "gmail",
                auth: { user, pass },
            });
        }
        if (host) {
            return nodemailer_1.default.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            });
        }
    }
    return null;
};
const getClientUrl = () => {
    const raw = process.env.CLIENT_URL || "http://localhost:3001";
    return raw.includes(",") ? raw.split(",")[0].trim() : raw.trim();
};
const sendVerificationEmail = async (email, name, rawCode) => {
    const clientUrl = getClientUrl();
    const verificationUrl = `${clientUrl}/verify-email?code=${rawCode}&email=${encodeURIComponent(email)}`;
    const transporter = createTransporter();
    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #0f172a;">
      <div style="margin-bottom: 24px; text-align: center;">
        <span style="font-size: 20px; font-weight: 800; color: #4f46e5;">Tech<span style="color: #0ea5e9;">Dadu</span></span>
      </div>
      <h2 style="color: #0f172a; margin-bottom: 12px; font-size: 22px; font-weight: 700; text-align: center;">Verify Your Email Address</h2>
      <p style="color: #475569; font-size: 15px; line-height: 24px; text-align: center;">
        Hi <strong>${name}</strong>, use the 6-digit verification code below to activate your account:
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #4f46e5; border-radius: 12px; padding: 16px 32px;">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #4f46e5; font-family: 'Courier New', Courier, monospace; margin-left: 10px;">
            ${rawCode}
          </span>
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 10px;">This code expires in 60 minutes.</p>
      </div>

      <div style="text-align: center; margin-bottom: 28px;">
        <p style="color: #64748b; font-size: 14px; margin-bottom: 12px;">Or verify automatically with a single click:</p>
        <a href="${verificationUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 11px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
          Verify Instantly
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; line-height: 18px;">
        If you didn't create an account with Tech Dadu, you can safely ignore this email.<br />
        &copy; ${new Date().getFullYear()} Tech Dadu. Secure Auth Service.
      </p>
    </div>
  `;
    if (transporter) {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM || '"Tech Dadu" <no-reply@techdadu.com>',
                to: email,
                subject: `${rawCode} is your Tech Dadu verification code`,
                html,
            });
            console.log(`[EMAIL] 6-digit verification code sent to ${email}`);
        }
        catch (err) {
            console.error("[EMAIL ERROR] Failed to send email via SMTP:", err);
        }
    }
    else {
        console.log("-----------------------------------------");
        console.log(`[EMAIL SIMULATION] To: ${email}`);
        console.log(`[EMAIL SIMULATION] 6-Digit Code: ${rawCode}`);
        console.log(`[EMAIL SIMULATION] Instant Link: ${verificationUrl}`);
        console.log("-----------------------------------------");
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, name, rawToken) => {
    const clientUrl = getClientUrl();
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;
    const transporter = createTransporter();
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #0f172a; margin-bottom: 16px;">Reset Your Password</h2>
      <p style="color: #475569; font-size: 16px; line-height: 24px;">Hi ${name},</p>
      <p style="color: #475569; font-size: 16px; line-height: 24px;">You requested to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #dc2626; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #64748b; font-size: 14px;">This link will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">Tech Dadu &bull; Secure Authentication Service</p>
    </div>
  `;
    if (transporter) {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM || '"Tech Dadu" <no-reply@techdadu.com>',
                to: email,
                subject: "Password Reset Request - Tech Dadu",
                html,
            });
            console.log(`[EMAIL] Password reset email sent to ${email}`);
        }
        catch (err) {
            console.error("[EMAIL ERROR] Failed to send reset email via SMTP:", err);
        }
    }
    else {
        console.log("-----------------------------------------");
        console.log(`[EMAIL SIMULATION] To: ${email}`);
        console.log(`[EMAIL SIMULATION] Password Reset Link: ${resetUrl}`);
        console.log("-----------------------------------------");
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
