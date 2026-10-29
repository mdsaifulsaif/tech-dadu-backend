import { Request, Response, NextFunction } from "express";
import { SiteSettingService } from "../services/siteSetting.service";
import { sendResponse } from "../utils/response";

export class SiteSettingController {
  // Public endpoint for frontend to read GTM, SEO meta, site name, logo etc.
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SiteSettingService.getSettings();
      return sendResponse(res, 200, true, "Site settings retrieved successfully", settings);
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint to update GTM, GA4, Meta, Pinterest IDs, etc.
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SiteSettingService.updateSettings(req.body);
      return sendResponse(res, 200, true, "Site settings updated successfully", settings);
    } catch (error) {
      next(error);
    }
  }
}

