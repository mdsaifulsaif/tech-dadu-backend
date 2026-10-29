"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberService = void 0;
const subscriber_model_1 = require("../models/subscriber.model");
const nodemailer_1 = __importDefault(require("nodemailer"));
const ApiError_1 = require("../utils/ApiError");
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
class SubscriberService {
    static async subscribe(email, source = "website") {
        let subscriber = await subscriber_model_1.Subscriber.findOne({ email });
        if (subscriber) {
            if (subscriber.status === "subscribed") {
                return {
                    email: subscriber.email,
                    message: "You are already subscribed to our newsletter!",
                };
            }
            subscriber.status = "subscribed";
            subscriber.source = source;
            await subscriber.save();
        }
        else {
            subscriber = await subscriber_model_1.Subscriber.create({
                email,
                source,
                status: "subscribed",
            });
        }
        // Send Welcome Email
        const transporter = createTransporter();
        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
        const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-bottom: 16px;">Welcome to the Tech Dadu Community! 🚀</h2>
        <p style="color: #475569; font-size: 16px; line-height: 24px;">Thank you for joining our newsletter. You'll now receive curated updates on:</p>
        <ul style="color: #475569; font-size: 15px; line-height: 24px;">
          <li>Top-rated desk setup gear & laptop accessories</li>
          <li>Free Next.js & MERN Stack UI templates & boilerplates</li>
          <li>Modern web design inspirations & exclusive tech deals</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${clientUrl}/templates" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Explore Free Templates</a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">You can unsubscribe at any time from our website.</p>
      </div>
    `;
        if (transporter) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || '"Tech Dadu" <no-reply@techdadu.com>',
                    to: email,
                    subject: "Welcome to Tech Dadu! 🚀 Here are your developer resources",
                    html: welcomeHtml,
                });
            }
            catch (err) {
                console.error("[NEWSLETTER EMAIL ERROR]:", err);
            }
        }
        return {
            email: subscriber.email,
            message: "Successfully subscribed to our newsletter! Please check your inbox.",
        };
    }
    static async unsubscribe(email) {
        const subscriber = await subscriber_model_1.Subscriber.findOne({ email });
        if (!subscriber) {
            throw new ApiError_1.ApiError(404, "Subscriber not found");
        }
        subscriber.status = "unsubscribed";
        await subscriber.save();
        return {
            email,
            message: "You have been successfully unsubscribed.",
        };
    }
    static async getAllSubscribers(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [subscribers, total, active] = await Promise.all([
            subscriber_model_1.Subscriber.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            subscriber_model_1.Subscriber.countDocuments(),
            subscriber_model_1.Subscriber.countDocuments({ status: "subscribed" }),
        ]);
        return {
            subscribers,
            stats: {
                totalSubscribers: total,
                activeSubscribers: active,
            },
            pagination: {
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async broadcastEmail(subject, content) {
        const activeSubscribers = await subscriber_model_1.Subscriber.find({
            status: "subscribed",
        }).select("email");
        if (activeSubscribers.length === 0) {
            throw new ApiError_1.ApiError(400, "No active subscribers found to broadcast email");
        }
        const transporter = createTransporter();
        if (!transporter) {
            throw new ApiError_1.ApiError(500, "SMTP configuration is missing. Cannot send emails.");
        }
        const recipientEmails = activeSubscribers.map((s) => s.email);
        // Send in chunks or via BCC to protect privacy
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Tech Dadu" <no-reply@techdadu.com>',
            bcc: recipientEmails,
            subject,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          ${content}
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Tech Dadu &bull; Automated Newsletter</p>
        </div>
      `,
        });
        return {
            message: `Broadcast sent successfully to ${recipientEmails.length} subscribers`,
            count: recipientEmails.length,
        };
    }
}
exports.SubscriberService = SubscriberService;
