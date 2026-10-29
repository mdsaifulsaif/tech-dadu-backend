"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogController = void 0;
const blog_service_1 = require("../services/blog.service");
const response_1 = require("../utils/response");
class BlogController {
    static async create(req, res, next) {
        try {
            const authorId = req.user.userId;
            const blog = await blog_service_1.BlogService.createBlog(authorId, req.body);
            return (0, response_1.sendResponse)(res, 201, true, "Blog article created successfully", blog);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAll(req, res, next) {
        try {
            const { category, tag, search, status, sort, page, limit } = req.query;
            const filters = {
                category: category,
                tag: tag,
                search: search,
                status: status,
                sort: sort,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 9,
            };
            const result = await blog_service_1.BlogService.getAllBlogs(filters);
            return (0, response_1.sendResponse)(res, 200, true, "Blogs retrieved successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const blog = await blog_service_1.BlogService.getBlogBySlug(slug);
            return (0, response_1.sendResponse)(res, 200, true, "Blog retrieved successfully", blog);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const blog = await blog_service_1.BlogService.getBlogById(id);
            return (0, response_1.sendResponse)(res, 200, true, "Blog retrieved successfully", blog);
        }
        catch (error) {
            next(error);
        }
    }
    static async getRelated(req, res, next) {
        try {
            const { id } = req.params;
            const limit = req.query.limit ? Number(req.query.limit) : 4;
            const related = await blog_service_1.BlogService.getRelatedBlogs(id, limit);
            return (0, response_1.sendResponse)(res, 200, true, "Related articles retrieved", related);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const blog = await blog_service_1.BlogService.updateBlog(id, req.body);
            return (0, response_1.sendResponse)(res, 200, true, "Blog updated successfully", blog);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const result = await blog_service_1.BlogService.deleteBlog(id);
            return (0, response_1.sendResponse)(res, 200, true, result.message, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BlogController = BlogController;
