import { Schema, model, Document, Types } from "mongoose";

export interface IAffiliateLink {
  platform: "amazon" | "aliexpress" | "official" | "other";
  url: string;
  isPrimary: boolean;
}

export interface IProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface IProductPrice {
  amount: number;
  currency: string;
  formatted?: string;
}

export interface IProductComparison {
  isFeatured?: boolean;
  badge?: string;
  bestFor?: string;
  keyHighlight?: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  category: Types.ObjectId;
  images: string[];
  shortSummary: string;
  description: string;
  price: IProductPrice;
  affiliateLinks: IAffiliateLink[];
  rating: number;
  pros: string[];
  cons: string[];
  badges: string[];
  isFeatured: boolean;
  comparison?: IProductComparison;
  status: "draft" | "published";
  clickCount: number;
  seo: IProductSEO;
  createdAt: Date;
  updatedAt: Date;
}

const affiliateLinkSchema = new Schema<IAffiliateLink>(
  {
    platform: {
      type: String,
      enum: ["amazon", "aliexpress", "official", "other"],
      default: "amazon",
    },
    url: {
      type: String,
      required: [true, "Affiliate URL is required"],
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
    },
    shortSummary: {
      type: String,
      required: [true, "Short summary is required"],
      maxlength: [300, "Summary cannot exceed 300 characters"],
    },
    description: {
      type: String,
      required: [true, "Detailed product description is required"],
    },
    price: {
      amount: { type: Number, required: true, default: 0 },
      currency: { type: String, default: "USD" },
      formatted: { type: String, default: "" },
    },
    affiliateLinks: {
      type: [affiliateLinkSchema],
      required: [true, "At least one affiliate link is required"],
      validate: [
        (val: IAffiliateLink[]) => val.length > 0,
        "Please provide at least one affiliate link",
      ],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.8,
    },
    pros: {
      type: [String],
      default: [],
    },
    cons: {
      type: [String],
      default: [],
    },
    badges: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    comparison: {
      isFeatured: { type: Boolean, default: false, index: true },
      badge: { type: String, default: "Best Overall" },
      bestFor: { type: String, default: "Everyday use" },
      keyHighlight: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
      index: true,
    },
    clickCount: {
      type: Number,
      default: 0,
      index: true,
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      keywords: { type: [String], default: [] },
      ogImage: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// Auto-format price before save if not provided
productSchema.pre("save", function () {
  if (!this.price.formatted) {
    this.price.formatted = `$${this.price.amount.toFixed(2)}`;
  }
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = `${this.title} | Review & Buying Guide`;
  }
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.shortSummary;
  }
  if (!this.seo.ogImage && this.images.length > 0) {
    this.seo.ogImage = this.images[0];
  }
});

export const Product = model<IProduct>("Product", productSchema);

