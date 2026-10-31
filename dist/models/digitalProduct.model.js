"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalProduct = void 0;
const mongoose_1 = require("mongoose");
const digitalProductSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Template/product title is required"],
        trim: true,
        maxlength: [200, "Title cannot exceed 200 characters"],
        index: true,
    },
    slug: {
        type: String,
        required: [true, "Slug is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"],
        index: true,
    },
    shortSummary: {
        type: String,
        default: "",
        maxlength: [300, "Short summary cannot exceed 300 characters"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    features: {
        type: [String],
        default: [],
    },
    techStack: {
        type: [String],
        required: [true, "At least one tech stack item is required"],
        index: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    isFree: {
        type: Boolean,
        default: false,
        index: true,
    },
    liveDemoUrl: {
        type: String,
        default: "",
    },
    purchaseUrl: {
        type: String,
        required: [true, "Purchase or download URL is required"],
    },
    previewImages: {
        type: [String],
        required: [true, "At least one preview image is required"],
    },
    downloadCount: {
        type: Number,
        default: 0,
        index: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
        index: true,
    },
    badges: {
        type: [String],
        default: [],
    },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "published",
        index: true,
    },
    seo: {
        metaTitle: { type: String, default: "" },
        metaDescription: { type: String, default: "" },
        ogImage: { type: String, default: "" },
        keywords: { type: [String], default: [] },
    },
}, {
    timestamps: true,
});
digitalProductSchema.pre("save", function () {
    this.isFree = this.price === 0;
    if (!this.seo.metaTitle) {
        this.seo.metaTitle = `${this.title} | Next.js & MERN Template`;
    }
    if (!this.seo.metaDescription) {
        this.seo.metaDescription = this.shortSummary;
    }
    if (!this.seo.ogImage && this.previewImages.length > 0) {
        this.seo.ogImage = this.previewImages[0];
    }
});
exports.DigitalProduct = (0, mongoose_1.model)("DigitalProduct", digitalProductSchema);
