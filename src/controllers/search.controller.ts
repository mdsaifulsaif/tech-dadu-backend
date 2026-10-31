import { Request, Response, NextFunction } from "express";
import { SearchService } from "../services/search.service";
import { sendResponse } from "../utils/response";

export class SearchController {
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q || req.query.query || "") as string;
      const results = await SearchService.globalSearch(q);
      return sendResponse(res, 200, true, "Search results retrieved successfully", results);
    } catch (error) {
      next(error);
    }
  }
}
