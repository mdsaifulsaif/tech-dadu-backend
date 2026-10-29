"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("../services/category.service");
const response_1 = require("../utils/response");
class CategoryController {
    static async create(req, res, next) {
        try {
            const category = await category_service_1.CategoryService.createCategory(req.body);
            return (0, response_1.sendResponse)(res, 201, true, "Category created successfully", category);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAll(req, res, next) {
        try {
            const { type } = req.query;
            const categories = await category_service_1.CategoryService.getAllCategories(type);
            return (0, response_1.sendResponse)(res, 200, true, "Categories retrieved successfully", categories);
        }
        catch (error) {
            next(error);
        }
    }
    static async getBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const category = await category_service_1.CategoryService.getCategoryBySlug(slug);
            return (0, response_1.sendResponse)(res, 200, true, "Category retrieved successfully", category);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const category = await category_service_1.CategoryService.updateCategory(id, req.body);
            return (0, response_1.sendResponse)(res, 200, true, "Category updated successfully", category);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const result = await category_service_1.CategoryService.deleteCategory(id);
            return (0, response_1.sendResponse)(res, 200, true, result.message, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CategoryController = CategoryController;
