"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteSetting = void 0;
const mongoose_1 = require("mongoose");
const siteSettingSchema = new mongoose_1.Schema({
    siteName: {
        type: String,
        default: "Tech Dadu",
        trim: true,
    },
    siteTagline: {
        type: String,
        default: "Curated Desk Setup Gear & Modern Web Dev Templates",
        trim: true,
    },
    siteDescription: {
        type: String,
        default: "Tech Dadu is your ultimate hub for top-rated desk accessories, mechanical keyboards, Next.js templates, and modern tech inspirations.",
        trim: true,
    },
    siteUrl: {
        type: String,
        default: "https://techdadu.com",
        trim: true,
    },
    logoUrl: {
        type: String,
        default: "",
    },
    faviconUrl: {
        type: String,
        default: "",
    },
    contactEmail: {
        type: String,
        default: "support@techdadu.com",
        trim: true,
    },
    defaultOgImage: {
        type: String,
        default: "",
    },
    socialLinks: {
        pinterest: { type: String, default: "" },
        github: { type: String, default: "" },
        twitter: { type: String, default: "" },
        youtube: { type: String, default: "" },
        facebook: { type: String, default: "" },
        linkedin: { type: String, default: "" },
    },
    analytics: {
        gtmId: { type: String, default: "" },
        gaId: { type: String, default: "" },
        metaPixelId: { type: String, default: "" },
        pinterestTagId: { type: String, default: "" },
        pinterestVerification: { type: String, default: "" },
        googleVerification: { type: String, default: "" },
    },
    announcement: {
        enabled: { type: Boolean, default: false },
        text: { type: String, default: "" },
        link: { type: String, default: "" },
    },
}, {
    timestamps: true,
});
exports.SiteSetting = (0, mongoose_1.model)("SiteSetting", siteSettingSchema);
