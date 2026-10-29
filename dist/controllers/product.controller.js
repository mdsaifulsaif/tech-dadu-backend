"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
const response_1 = require("../utils/response");
class ProductController {
    static async create(req, res, next) {
        try {
            const product = await product_service_1.ProductService.createProduct(req.body);
            return (0, response_1.sendResponse)(res, 201, true, "Product created successfully", product);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAll(req, res, next) {
        try {
            const { category, search, isFeatured, badge, minPrice, maxPrice, status, sort, page, limit, } = req.query;
            const filters = {
                category: category,
                search: search,
                isFeatured: isFeatured !== undefined ? isFeatured === "true" : undefined,
                badge: badge,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                status: status,
                sort: sort,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 12,
            };
            const result = await product_service_1.ProductService.getAllProducts(filters);
            return (0, response_1.sendResponse)(res, 200, true, "Products retrieved successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const product = await product_service_1.ProductService.getProductBySlug(slug);
            return (0, response_1.sendResponse)(res, 200, true, "Product retrieved successfully", product);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await product_service_1.ProductService.getProductById(id);
            return (0, response_1.sendResponse)(res, 200, true, "Product retrieved successfully", product);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const product = await product_service_1.ProductService.updateProduct(id, req.body);
            return (0, response_1.sendResponse)(res, 200, true, "Product updated successfully", product);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const result = await product_service_1.ProductService.deleteProduct(id);
            return (0, response_1.sendResponse)(res, 200, true, result.message, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async trackClick(req, res, next) {
        try {
            const { id } = req.params;
            const { platform, redirect } = req.query;
            const referrer = (req.headers.referer || req.headers.referrer || "direct");
            const userAgent = req.headers["user-agent"] || "";
            const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
            const clickData = await product_service_1.ProductService.trackOutboundClick(id, {
                platform: platform,
                referrer,
                ip,
                userAgent,
            });
            // If requested with redirect=true, perform HTTP 302 redirect directly to affiliate link
            if (redirect === "true" || redirect === "1") {
                return res.redirect(302, clickData.url);
            }
            return (0, response_1.sendResponse)(res, 200, true, "Outbound click tracked successfully", clickData);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProductController = ProductController;
