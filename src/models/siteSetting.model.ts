import { Schema, model, Document } from "mongoose";

export interface ISocialLinks {
  pinterest?: string;
  github?: string;
  twitter?: string;
  youtube?: string;
  facebook?: string;
  linkedin?: string;
}

export interface IAnalyticsSettings {
  gtmId?: string; // Google Tag Manager ID (e.g., GTM-XXXXXXX)
  gaId?: string; // Google Analytics 4 ID (e.g., G-XXXXXXXXXX)
  metaPixelId?: string; // Meta/Facebook Pixel ID
  pinterestTagId?: string; // Pinterest Tag ID
  pinterestVerification?: string; // Meta tag code for Pinterest Domain Claiming
  googleVerification?: string; // Meta tag code for Google Search Console
}

export interface IAnnouncementBar {
  enabled: boolean;
  text?: string;
  link?: string;
}

export interface ISiteSetting extends Document {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactEmail?: string;
  defaultOgImage?: string;
  socialLinks: ISocialLinks;
  analytics: IAnalyticsSettings;
  announcement: IAnnouncementBar;
  createdAt: Date;
  updatedAt: Date;
}

const siteSettingSchema = new Schema<ISiteSetting>(
  {
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
      default:
        "Tech Dadu is your ultimate hub for top-rated desk accessories, mechanical keyboards, Next.js templates, and modern tech inspirations.",
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
  },
  {
    timestamps: true,
  }
);

export const SiteSetting = model<ISiteSetting>("SiteSetting", siteSettingSchema);

