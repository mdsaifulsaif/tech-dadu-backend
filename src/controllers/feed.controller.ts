import { Request, Response, NextFunction } from "express";
import { FeedService } from "../services/feed.service";

export class FeedController {
  static async getPinterestFeed(_req: Request, res: Response, next: NextFunction) {
    try {
      const xml = await FeedService.generatePinterestRssFeed();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
      return res.status(200).send(xml);
    } catch (error) {
      next(error);
    }
  }

  static async getSitemap(_req: Request, res: Response, next: NextFunction) {
    try {
      const xml = await FeedService.generateSitemapXml();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
      return res.status(200).send(xml);
    } catch (error) {
      next(error);
    }
  }
}

