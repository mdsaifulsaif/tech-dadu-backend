import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

// Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const googleAuthSchema = z.object({
  idToken: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  image: z.string().optional(),
  googleId: z.string().optional(),
});

// Category Schemas
export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(100),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  type: z.enum(["product", "blog", "template", "all"]).optional(),
  order: z.number().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Product Schemas
export const createProductSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z.string().optional(),
  category: z.string().min(1, "Category ID is required"),
  images: z.array(z.string().url("Must be valid image URL")).min(1, "At least one image is required"),
  shortSummary: z.string().min(10, "Summary must be at least 10 characters").max(300),
  description: z.string().min(20, "Detailed description must be at least 20 characters"),
  price: z.object({
    amount: z.number().min(0, "Price cannot be negative"),
    currency: z.string().default("USD").optional(),
    formatted: z.string().optional(),
  }),
  affiliateLinks: z.array(
    z.object({
      platform: z.enum(["amazon", "aliexpress", "official", "other"]),
      url: z.string().url("Must be a valid URL"),
      isPrimary: z.boolean().default(true).optional(),
    })
  ).min(1, "At least one affiliate link is required"),
  rating: z.number().min(1).max(5).optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
  }).optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Blog Schemas
export const createBlogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(250),
  slug: z.string().optional(),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(400),
  content: z.string().min(20, "Content must be at least 20 characters"),
  coverImage: z.string().url("Cover image must be a valid URL"),
  category: z.string().min(1, "Category ID is required"),
  tags: z.array(z.string()).optional(),
  linkedProducts: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    canonicalUrl: z.string().optional(),
    ogImage: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

export const updateBlogSchema = createBlogSchema.partial();

// Digital Product / Template Schemas
export const createDigitalProductSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z.string().optional(),
  category: z.string().min(1, "Category ID is required"),
  shortSummary: z.string().max(300).optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  features: z.array(z.string()).optional(),
  techStack: z.array(z.string()).min(1, "At least one tech stack item is required"),
  price: z.number().min(0, "Price cannot be negative"),
  liveDemoUrl: z.string().url("Live demo must be a valid URL").optional().or(z.literal("")),
  purchaseUrl: z.string().url("Purchase/download link must be a valid URL"),
  previewImages: z.array(z.string().url("Must be valid image URL")).min(1, "At least one preview image is required"),
  isFeatured: z.boolean().optional(),
  badges: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    ogImage: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
});

export const updateDigitalProductSchema = createDigitalProductSchema.partial();

// Newsletter & Subscriber Schemas
export const subscribeSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  source: z.string().optional(),
});

export const broadcastSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => issue.message).join(", ");
        next(new ApiError(400, errorMessages, error.issues));
      } else {
        next(error);
      }
    }
  };
};
