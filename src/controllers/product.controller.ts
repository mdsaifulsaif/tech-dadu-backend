import { Request, Response, NextFunction } from "express";
import { ProductService, IProductQueryFilters } from "../services/product.service";
import { sendResponse } from "../utils/response";

export class ProductController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createProduct(req.body);
      return sendResponse(res, 201, true, "Product created successfully", product);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        category,
        search,
        isFeatured,
        isComparison,
        badge,
        minPrice,
        maxPrice,
        status,
        sort,
        page,
        limit,
      } = req.query;

      const filters: IProductQueryFilters = {
        category: category as string,
        search: search as string,
        isFeatured: isFeatured !== undefined ? isFeatured === "true" : undefined,
        isComparison: isComparison !== undefined ? isComparison === "true" : undefined,
        badge: badge as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        status: status as any,
        sort: sort as any,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
      };

      const result = await ProductService.getAllProducts(filters);
      return sendResponse(res, 200, true, "Products retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await ProductService.getProductBySlug(slug as string);
      return sendResponse(res, 200, true, "Product retrieved successfully", product);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id as string);
      return sendResponse(res, 200, true, "Product retrieved successfully", product);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.updateProduct(id as string, req.body);
      return sendResponse(res, 200, true, "Product updated successfully", product);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ProductService.deleteProduct(id as string);
      return sendResponse(res, 200, true, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  static async trackClick(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { platform, redirect } = req.query;
      const referrer = (req.headers.referer || req.headers.referrer || "direct") as string;
      const userAgent = req.headers["user-agent"] || "";
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";

      const clickData = await ProductService.trackOutboundClick(id as string, {
        platform: platform as string,
        referrer,
        ip,
        userAgent,
      });

      // If requested with redirect=true, perform HTTP 302 redirect directly to affiliate link
      if (redirect === "true" || redirect === "1") {
        return res.redirect(302, clickData.url);
      }

      return sendResponse(res, 200, true, "Outbound click tracked successfully", clickData);
    } catch (error) {
      next(error);
    }
  }
}

