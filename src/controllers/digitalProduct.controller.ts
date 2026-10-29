import { Request, Response, NextFunction } from "express";
import {
  DigitalProductService,
  IDigitalProductFilters,
} from "../services/digitalProduct.service";
import { sendResponse } from "../utils/response";

export class DigitalProductController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await DigitalProductService.createDigitalProduct(req.body);
      return sendResponse(res, 201, true, "Template created successfully", product);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        category,
        techStack,
        isFree,
        isFeatured,
        search,
        status,
        sort,
        page,
        limit,
      } = req.query;

      const filters: IDigitalProductFilters = {
        category: category as string,
        techStack: techStack as string,
        isFree: isFree !== undefined ? isFree === "true" : undefined,
        isFeatured: isFeatured !== undefined ? isFeatured === "true" : undefined,
        search: search as string,
        status: status as any,
        sort: sort as any,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
      };

      const result = await DigitalProductService.getAllDigitalProducts(filters);
      return sendResponse(res, 200, true, "Templates retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await DigitalProductService.getDigitalProductBySlug(slug as string);
      return sendResponse(res, 200, true, "Template retrieved successfully", product);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await DigitalProductService.getDigitalProductById(id as string);
      return sendResponse(res, 200, true, "Template retrieved successfully", product);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await DigitalProductService.updateDigitalProduct(
        id as string,
        req.body
      );
      return sendResponse(res, 200, true, "Template updated successfully", product);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await DigitalProductService.deleteDigitalProduct(id as string);
      return sendResponse(res, 200, true, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  static async trackAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { action, redirect } = req.query;
      const referrer = (req.headers.referer || req.headers.referrer || "direct") as string;
      const userAgent = req.headers["user-agent"] || "";
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";

      const result = await DigitalProductService.trackAction(id as string, {
        action: action as any,
        referrer,
        ip,
        userAgent,
      });

      if (redirect === "true" || redirect === "1") {
        return res.redirect(302, result.url);
      }

      return sendResponse(res, 200, true, "Action tracked successfully", result);
    } catch (error) {
      next(error);
    }
  }
}

