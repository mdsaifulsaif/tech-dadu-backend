"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const blog_model_1 = require("../models/blog.model");
const category_model_1 = require("../models/category.model");
const product_model_1 = require("../models/product.model");
const ApiError_1 = require("../utils/ApiError");
const slugify_1 = require("../utils/slugify");
const mongoose_1 = require("mongoose");
class BlogService {
    static async createBlog(authorId, data) {
        const category = await category_model_1.Category.findById(data.category);
        if (!category) {
            throw new ApiError_1.ApiError(400, "Invalid Category ID provided");
        }
        const slug = data.slug ? (0, slugify_1.slugify)(data.slug) : (0, slugify_1.slugify)(data.title);
        const existing = await blog_model_1.Blog.findOne({ slug });
        if (existing) {
            throw new ApiError_1.ApiError(400, `Blog with slug '${slug}' already exists`);
        }
        // Verify linked products if any provided
        if (data.linkedProducts && data.linkedProducts.length > 0) {
            const validProductsCount = await product_model_1.Product.countDocuments({
                _id: { $in: data.linkedProducts },
            });
            if (validProductsCount !== data.linkedProducts.length) {
                throw new ApiError_1.ApiError(400, "One or more linked product IDs are invalid");
            }
        }
        const blog = await blog_model_1.Blog.create({
            ...data,
            slug,
            author: new mongoose_1.Types.ObjectId(authorId),
        });
        return await blog.populate([
            { path: "category", select: "name slug icon" },
            { path: "author", select: "name avatar" },
            {
                path: "linkedProducts",
                select: "title slug price images rating badges affiliateLinks",
            },
        ]);
    }
    static async getAllBlogs(filters) {
        const { category, tag, search, status = "published", sort = "newest", page = 1, limit = 9, } = filters;
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
        if (tag) {
            query.tags = { $in: [new RegExp(tag, "i")] };
        }
        if (search) {
            const searchRegex = new RegExp(search, "i");
            query.$or = [
                { title: searchRegex },
                { excerpt: searchRegex },
                { tags: searchRegex },
            ];
        }
        let sortOptions = { publishedAt: -1 };
        if (sort === "popular")
            sortOptions = { views: -1 };
        else if (sort === "oldest")
            sortOptions = { publishedAt: 1 };
        const skip = (page - 1) * limit;
        const [blogs, totalCount] = await Promise.all([
            blog_model_1.Blog.find(query)
                .populate("category", "name slug icon")
                .populate("author", "name avatar")
                .populate("linkedProducts", "title slug price images rating badges affiliateLinks")
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            blog_model_1.Blog.countDocuments(query),
        ]);
        const totalPages = Math.ceil(totalCount / limit);
        return {
            blogs,
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
    static async getBlogBySlug(slug) {
        // Atomically increment view count
        const blog = await blog_model_1.Blog.findOneAndUpdate({ slug, status: "published" }, { $inc: { views: 1 } }, { new: true })
            .populate("category", "name slug icon")
            .populate("author", "name avatar")
            .populate("linkedProducts", "title slug shortSummary price images rating badges affiliateLinks clickCount")
            .lean();
        if (!blog) {
            throw new ApiError_1.ApiError(404, `Blog article '${slug}' not found`);
        }
        return blog;
    }
    static async getBlogById(id) {
        const blog = await blog_model_1.Blog.findById(id)
            .populate("category", "name slug icon")
            .populate("author", "name avatar")
            .populate("linkedProducts", "title slug price images rating badges affiliateLinks")
            .lean();
        if (!blog) {
            throw new ApiError_1.ApiError(404, "Blog article not found");
        }
        return blog;
    }
    static async updateBlog(id, data) {
        if (data.title && !data.slug) {
            data.slug = (0, slugify_1.slugify)(data.title);
        }
        else if (data.slug) {
            data.slug = (0, slugify_1.slugify)(data.slug);
        }
        if (data.slug) {
            const existing = await blog_model_1.Blog.findOne({
                slug: data.slug,
                _id: { $ne: id },
            });
            if (existing) {
                throw new ApiError_1.ApiError(400, `Blog slug '${data.slug}' is already taken`);
            }
        }
        if (data.category) {
            const category = await category_model_1.Category.findById(data.category);
            if (!category) {
                throw new ApiError_1.ApiError(400, "Invalid Category ID");
            }
        }
        const blog = await blog_model_1.Blog.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).populate([
            { path: "category", select: "name slug icon" },
            { path: "author", select: "name avatar" },
            { path: "linkedProducts", select: "title slug price images rating badges affiliateLinks" },
        ]);
        if (!blog) {
            throw new ApiError_1.ApiError(404, "Blog article not found");
        }
        return blog;
    }
    static async deleteBlog(id) {
        const blog = await blog_model_1.Blog.findByIdAndDelete(id);
        if (!blog) {
            throw new ApiError_1.ApiError(404, "Blog article not found");
        }
        return { id, message: "Blog article deleted successfully" };
    }
    // Get related blogs based on category or common tags
    static async getRelatedBlogs(blogId, limit = 4) {
        const currentBlog = await blog_model_1.Blog.findById(blogId);
        if (!currentBlog) {
            throw new ApiError_1.ApiError(404, "Blog not found");
        }
        const related = await blog_model_1.Blog.find({
            _id: { $ne: currentBlog._id },
            status: "published",
            $or: [
                { category: currentBlog.category },
                { tags: { $in: currentBlog.tags } },
            ],
        })
            .populate("category", "name slug")
            .populate("author", "name avatar")
            .sort({ views: -1, publishedAt: -1 })
            .limit(limit)
            .lean();
        return related;
    }
}
exports.BlogService = BlogService;
