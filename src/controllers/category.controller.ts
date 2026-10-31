import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";
import { sendResponse } from "../utils/response";

export class CategoryController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.createCategory(req.body);
      return sendResponse(res, 201, true, "Category created successfully", category);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, hero } = req.query;
      const isHero = hero === "true" || hero === "1";
      const categories = await CategoryService.getAllCategories(type as string, isHero);
      return sendResponse(res, 200, true, "Categories retrieved successfully", categories);
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const category = await CategoryService.getCategoryBySlug(slug as string);
      return sendResponse(res, 200, true, "Category retrieved successfully", category);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await CategoryService.updateCategory(id as string, req.body);
      return sendResponse(res, 200, true, "Category updated successfully", category);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CategoryService.deleteCategory(id as string);
      return sendResponse(res, 200, true, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}

