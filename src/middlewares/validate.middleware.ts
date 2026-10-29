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
