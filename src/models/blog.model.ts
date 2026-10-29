import { Schema, model, Document, Types } from "mongoose";

export interface IBlogSEO {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  keywords?: string[];
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: Types.ObjectId;
  category: Types.ObjectId;
  tags: string[];
  linkedProducts: Types.ObjectId[];
  readingTime: number; // In minutes
  views: number;
  status: "draft" | "published";
  publishedAt: Date;
  seo: IBlogSEO;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [250, "Title cannot exceed 250 characters"],
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Blog slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, "Short excerpt is required"],
      maxlength: [400, "Excerpt cannot exceed 400 characters"],
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover image URL is required"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    linkedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    readingTime: {
      type: Number,
      default: 3,
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      canonicalUrl: { type: String, default: "" },
      ogImage: { type: String, default: "" },
      keywords: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: auto-calculate reading time (~200 words per minute) & fill SEO defaults
blogSchema.pre("save", function () {
  if (this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = `${this.title} | Tech Dadu`;
  }
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.excerpt;
  }
  if (!this.seo.ogImage && this.coverImage) {
    this.seo.ogImage = this.coverImage;
  }
});

export const Blog = model<IBlog>("Blog", blogSchema);

