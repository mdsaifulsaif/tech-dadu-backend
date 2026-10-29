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
const sendVerificationEmail = async (email, name, rawToken) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const verificationUrl = `${clientUrl}/verify-email?token=${rawToken}`;
    const transporter = createTransporter();
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #0f172a; margin-bottom: 16px;">Verify Your Email Address</h2>
      <p style="color: #475569; font-size: 16px; line-height: 24px;">Hi ${name},</p>
      <p style="color: #475569; font-size: 16px; line-height: 24px;">Thank you for registering on Tech Dadu. Please verify your email address to complete your registration and activate your account.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email</a>
      </div>
      <p style="color: #64748b; font-size: 14px;">This link will expire in 24 hours. If you did not create this account, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">Tech Dadu &bull; Secure Authentication Service</p>
    </div>
  `;
    if (transporter) {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM || '"Tech Dadu" <no-reply@techdadu.com>',
                to: email,
                subject: "Verify Your Email Address - Tech Dadu",
                html,
            });
            console.log(`[EMAIL] Verification email sent to ${email}`);
        }
        catch (err) {
            console.error("[EMAIL ERROR] Failed to send email via SMTP:", err);
        }
    }
    else {
        console.log("-----------------------------------------");
        console.log(`[EMAIL SIMULATION] To: ${email}`);
        console.log(`[EMAIL SIMULATION] Verification Link: ${verificationUrl}`);
        console.log("-----------------------------------------");
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, name, rawToken) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
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
