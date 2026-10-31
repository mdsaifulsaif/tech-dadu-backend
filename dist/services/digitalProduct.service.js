"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalProductService = void 0;
const digitalProduct_model_1 = require("../models/digitalProduct.model");
const category_model_1 = require("../models/category.model");
const clickTracking_model_1 = require("../models/clickTracking.model");
const ApiError_1 = require("../utils/ApiError");
const slugify_1 = require("../utils/slugify");
const crypto_1 = __importDefault(require("crypto"));
class DigitalProductService {
    static async createDigitalProduct(data) {
        const category = await category_model_1.Category.findById(data.category);
        if (!category) {
            throw new ApiError_1.ApiError(400, "Invalid Category ID provided");
        }
        const slug = data.slug ? (0, slugify_1.slugify)(data.slug) : (0, slugify_1.slugify)(data.title);
        const existing = await digitalProduct_model_1.DigitalProduct.findOne({ slug });
        if (existing) {
            throw new ApiError_1.ApiError(400, `Template with slug '${slug}' already exists`);
        }
        const shortSummary = data.shortSummary || data.description?.slice(0, 160) || data.title;
        const digitalProduct = await digitalProduct_model_1.DigitalProduct.create({
            ...data,
            shortSummary,
            slug,
            isFree: data.price === 0,
        });
        return await digitalProduct.populate("category", "name slug icon");
    }
    static async getAllDigitalProducts(filters) {
        const { category, techStack, isFree, isFeatured, search, status = "published", sort = "newest", page = 1, limit = 12, } = filters;
        const query = {};
        if (status !== "all") {
            query.status = status;
        }
        if (category) {
            const catDoc = await category_model_1.Category.findOne({
                $or: [
                    { slug: category },
                    { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null },
                ],
            });
            if (catDoc) {
                query.category = catDoc._id;
            }
        }
        if (techStack) {
            query.techStack = { $in: [new RegExp(techStack, "i")] };
        }
        if (isFree !== undefined) {
            query.isFree = isFree;
        }
        if (isFeatured !== undefined) {
            query.isFeatured = isFeatured;
        }
        if (search) {
            const searchRegex = new RegExp(search, "i");
            query.$or = [
                { title: searchRegex },
                { shortSummary: searchRegex },
                { description: searchRegex },
                { techStack: searchRegex },
                { features: searchRegex },
            ];
        }
        let sortOptions = { createdAt: -1 };
        if (sort === "popular")
            sortOptions = { downloadCount: -1 };
        else if (sort === "price-asc")
            sortOptions = { price: 1 };
        else if (sort === "price-desc")
            sortOptions = { price: -1 };
        const skip = (page - 1) * limit;
        const [products, totalCount] = await Promise.all([
            digitalProduct_model_1.DigitalProduct.find(query)
                .populate("category", "name slug icon")
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            digitalProduct_model_1.DigitalProduct.countDocuments(query),
        ]);
        const totalPages = Math.ceil(totalCount / limit);
        return {
            templates: products,
            pagination: {
                totalItems: totalCount,
                totalPages,
                currentPage: page,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
    static async getDigitalProductBySlug(slug) {
        const product = await digitalProduct_model_1.DigitalProduct.findOne({ slug })
            .populate("category", "name slug icon")
            .lean();
        if (!product) {
            throw new ApiError_1.ApiError(404, `Template '${slug}' not found`);
        }
        return product;
    }
    static async getDigitalProductById(id) {
        const product = await digitalProduct_model_1.DigitalProduct.findById(id)
            .populate("category", "name slug icon")
            .lean();
        if (!product) {
            throw new ApiError_1.ApiError(404, "Template not found");
        }
        return product;
    }
    static async updateDigitalProduct(id, data) {
        if (data.title && !data.slug) {
            data.slug = (0, slugify_1.slugify)(data.title);
        }
        else if (data.slug) {
            data.slug = (0, slugify_1.slugify)(data.slug);
        }
        if (data.slug) {
            const existing = await digitalProduct_model_1.DigitalProduct.findOne({
                slug: data.slug,
                _id: { $ne: id },
            });
            if (existing) {
                throw new ApiError_1.ApiError(400, `Template slug '${data.slug}' is already taken`);
            }
        }
        if (data.price !== undefined) {
            data.isFree = data.price === 0;
        }
        if (data.category) {
            const category = await category_model_1.Category.findById(data.category);
            if (!category) {
                throw new ApiError_1.ApiError(400, "Invalid Category ID");
            }
        }
        const updated = await digitalProduct_model_1.DigitalProduct.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).populate("category", "name slug icon");
        if (!updated) {
            throw new ApiError_1.ApiError(404, "Template not found");
        }
        return updated;
    }
    static async deleteDigitalProduct(id) {
        const deleted = await digitalProduct_model_1.DigitalProduct.findByIdAndDelete(id);
        if (!deleted) {
            throw new ApiError_1.ApiError(404, "Template not found");
        }
        return { id, message: "Template deleted successfully" };
    }
    // Track download/checkout click and increment download counter
    static async trackAction(id, options) {
        const product = await digitalProduct_model_1.DigitalProduct.findById(id);
        if (!product) {
            throw new ApiError_1.ApiError(404, "Template not found");
        }
        const action = options.action || "purchase";
        const targetUrl = action === "demo" ? product.liveDemoUrl : product.purchaseUrl;
        if (!targetUrl) {
            throw new ApiError_1.ApiError(404, `No URL found for action '${action}'`);
        }
        if (action === "purchase") {
            product.downloadCount += 1;
            await product.save();
            const ipHash = options.ip
                ? crypto_1.default.createHash("sha256").update(options.ip).digest("hex").slice(0, 16)
                : "anonymous";
            await clickTracking_model_1.ClickTracking.create({
                targetType: "digital_product",
                targetId: product._id,
                platform: product.isFree ? "free_download" : "gumroad",
                referrer: options.referrer || "direct",
                ipHash,
                userAgent: options.userAgent || "",
            });
        }
        return {
            url: targetUrl,
            action,
            title: product.title,
            downloadCount: product.downloadCount,
        };
    }
}
exports.DigitalProductService = DigitalProductService;
