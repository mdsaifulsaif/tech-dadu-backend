"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalProductController = void 0;
const digitalProduct_service_1 = require("../services/digitalProduct.service");
const response_1 = require("../utils/response");
class DigitalProductController {
    static async create(req, res, next) {
        try {
            const product = await digitalProduct_service_1.DigitalProductService.createDigitalProduct(req.body);
            return (0, response_1.sendResponse)(res, 201, true, "Template created successfully", product);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAll(req, res, next) {
        try {
            const { category, techStack, isFree, isFeatured, search, status, sort, page, limit, } = req.query;
            const filters = {
                category: category,
                techStack: techStack,
                isFree: isFree !== undefined ? isFree === "true" : undefined,
                isFeatured: isFeatured !== undefined ? isFeatured === "true" : undefined,
                search: search,
                status: status,
                sort: sort,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 12,
            };
            const result = await digitalProduct_service_1.DigitalProductService.getAllDigitalProducts(filters);
            return (0, response_1.sendResponse)(res, 200, true, "Templates retrieved successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const product = await digitalProduct_service_1.DigitalProductService.getDigitalProductBySlug(slug);
            return (0, response_1.sendResponse)(res, 200, true, "Template retrieved successfully", product);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await digitalProduct_service_1.DigitalProductService.getDigitalProductById(id);
            return (0, response_1.sendResponse)(res, 200, true, "Template retrieved successfully", product);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const product = await digitalProduct_service_1.DigitalProductService.updateDigitalProduct(id, req.body);
            return (0, response_1.sendResponse)(res, 200, true, "Template updated successfully", product);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const result = await digitalProduct_service_1.DigitalProductService.deleteDigitalProduct(id);
            return (0, response_1.sendResponse)(res, 200, true, result.message, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async trackAction(req, res, next) {
        try {
            const { id } = req.params;
            const { action, redirect } = req.query;
            const referrer = (req.headers.referer || req.headers.referrer || "direct");
            const userAgent = req.headers["user-agent"] || "";
            const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
            const result = await digitalProduct_service_1.DigitalProductService.trackAction(id, {
                action: action,
                referrer,
                ip,
                userAgent,
            });
            if (redirect === "true" || redirect === "1") {
                return res.redirect(302, result.url);
            }
            return (0, response_1.sendResponse)(res, 200, true, "Action tracked successfully", result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DigitalProductController = DigitalProductController;
