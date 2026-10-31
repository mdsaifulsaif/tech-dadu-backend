import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service";
import { sendResponse } from "../utils/response";

export class AnalyticsController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getOverviewStats();
      return sendResponse(res, 200, true, "Analytics data retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  }
}

