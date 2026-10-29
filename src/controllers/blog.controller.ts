import { Request, Response, NextFunction } from "express";
import { BlogService, IBlogQueryFilters } from "../services/blog.service";
import { sendResponse } from "../utils/response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class BlogController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authorId = req.user!.userId;
      const blog = await BlogService.createBlog(authorId, req.body);
      return sendResponse(res, 201, true, "Blog article created successfully", blog);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, tag, search, status, sort, page, limit } = req.query;

      const filters: IBlogQueryFilters = {
        category: category as string,
        tag: tag as string,
        search: search as string,
        status: status as any,
        sort: sort as any,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 9,
      };

      const result = await BlogService.getAllBlogs(filters);
      return sendResponse(res, 200, true, "Blogs retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const blog = await BlogService.getBlogBySlug(slug as string);
      return sendResponse(res, 200, true, "Blog retrieved successfully", blog);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blog = await BlogService.getBlogById(id as string);
      return sendResponse(res, 200, true, "Blog retrieved successfully", blog);
    } catch (error) {
      next(error);
    }
  }

  static async getRelated(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : 4;
      const related = await BlogService.getRelatedBlogs(id as string, limit);
      return sendResponse(res, 200, true, "Related articles retrieved", related);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blog = await BlogService.updateBlog(id as string, req.body);
      return sendResponse(res, 200, true, "Blog updated successfully", blog);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await BlogService.deleteBlog(id as string);
      return sendResponse(res, 200, true, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}

