"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.broadcastSchema = exports.subscribeSchema = exports.updateDigitalProductSchema = exports.createDigitalProductSchema = exports.updateBlogSchema = exports.createBlogSchema = exports.updateProductSchema = exports.createProductSchema = exports.updateCategorySchema = exports.createCategorySchema = exports.googleAuthSchema = exports.resendVerificationSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const ApiError_1 = require("../utils/ApiError");
// Auth Schemas
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters").max(100),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
exports.resetPasswordSchema = zod_1.z.object({
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.resendVerificationSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
exports.googleAuthSchema = zod_1.z.object({
    idToken: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    name: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    googleId: zod_1.z.string().optional(),
});
// Category Schemas
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Category name must be at least 2 characters").max(100),
    slug: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    type: zod_1.z.enum(["product", "blog", "template", "all"]).optional(),
    order: zod_1.z.number().optional(),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
// Product Schemas
exports.createProductSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title must be at least 3 characters").max(200),
    slug: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1, "Category ID is required"),
    images: zod_1.z.array(zod_1.z.string().url("Must be valid image URL")).min(1, "At least one image is required"),
    shortSummary: zod_1.z.string().min(10, "Summary must be at least 10 characters").max(300),
    description: zod_1.z.string().min(20, "Detailed description must be at least 20 characters"),
    price: zod_1.z.object({
        amount: zod_1.z.number().min(0, "Price cannot be negative"),
        currency: zod_1.z.string().default("USD").optional(),
        formatted: zod_1.z.string().optional(),
    }),
    affiliateLinks: zod_1.z.array(zod_1.z.object({
        platform: zod_1.z.enum(["amazon", "aliexpress", "official", "other"]),
        url: zod_1.z.string().url("Must be a valid URL"),
        isPrimary: zod_1.z.boolean().default(true).optional(),
    })).min(1, "At least one affiliate link is required"),
    rating: zod_1.z.number().min(1).max(5).optional(),
    pros: zod_1.z.array(zod_1.z.string()).optional(),
    cons: zod_1.z.array(zod_1.z.string()).optional(),
    badges: zod_1.z.array(zod_1.z.string()).optional(),
    isFeatured: zod_1.z.boolean().optional(),
    status: zod_1.z.enum(["draft", "published"]).optional(),
    seo: zod_1.z.object({
        metaTitle: zod_1.z.string().optional(),
        metaDescription: zod_1.z.string().optional(),
        keywords: zod_1.z.array(zod_1.z.string()).optional(),
        ogImage: zod_1.z.string().optional(),
    }).optional(),
});
exports.updateProductSchema = exports.createProductSchema.partial();
// Blog Schemas
exports.createBlogSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, "Title must be at least 5 characters").max(250),
    slug: zod_1.z.string().optional(),
    excerpt: zod_1.z.string().min(10, "Excerpt must be at least 10 characters").max(400),
    content: zod_1.z.string().min(20, "Content must be at least 20 characters"),
    coverImage: zod_1.z.string().url("Cover image must be a valid URL"),
    category: zod_1.z.string().min(1, "Category ID is required"),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    linkedProducts: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(["draft", "published"]).optional(),
    seo: zod_1.z.object({
        metaTitle: zod_1.z.string().optional(),
        metaDescription: zod_1.z.string().optional(),
        canonicalUrl: zod_1.z.string().optional(),
        ogImage: zod_1.z.string().optional(),
        keywords: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
});
exports.updateBlogSchema = exports.createBlogSchema.partial();
// Digital Product / Template Schemas
exports.createDigitalProductSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title must be at least 3 characters").max(200),
    slug: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1, "Category ID is required"),
    shortSummary: zod_1.z.string().min(10, "Short summary must be at least 10 characters").max(300),
    description: zod_1.z.string().min(20, "Description must be at least 20 characters"),
    features: zod_1.z.array(zod_1.z.string()).optional(),
    techStack: zod_1.z.array(zod_1.z.string()).min(1, "At least one tech stack item is required"),
    price: zod_1.z.number().min(0, "Price cannot be negative"),
    liveDemoUrl: zod_1.z.string().url("Live demo must be a valid URL").optional().or(zod_1.z.literal("")),
    purchaseUrl: zod_1.z.string().url("Purchase/download link must be a valid URL"),
    previewImages: zod_1.z.array(zod_1.z.string().url("Must be valid image URL")).min(1, "At least one preview image is required"),
    isFeatured: zod_1.z.boolean().optional(),
    badges: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(["draft", "published"]).optional(),
    seo: zod_1.z.object({
        metaTitle: zod_1.z.string().optional(),
        metaDescription: zod_1.z.string().optional(),
        ogImage: zod_1.z.string().optional(),
        keywords: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
});
exports.updateDigitalProductSchema = exports.createDigitalProductSchema.partial();
// Newsletter & Subscriber Schemas
exports.subscribeSchema = zod_1.z.object({
    email: zod_1.z.string().email("Please provide a valid email address"),
    source: zod_1.z.string().optional(),
});
exports.broadcastSchema = zod_1.z.object({
    subject: zod_1.z.string().min(3, "Subject must be at least 3 characters"),
    content: zod_1.z.string().min(10, "Content must be at least 10 characters"),
});
const validate = (schema) => {
    return async (req, _res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.issues.map((issue) => issue.message).join(", ");
                next(new ApiError_1.ApiError(400, errorMessages, error.issues));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
