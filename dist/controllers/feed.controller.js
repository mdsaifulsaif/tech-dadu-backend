"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedController = void 0;
const feed_service_1 = require("../services/feed.service");
class FeedController {
    static async getPinterestFeed(_req, res, next) {
        try {
            const xml = await feed_service_1.FeedService.generatePinterestRssFeed();
            res.setHeader("Content-Type", "application/xml; charset=utf-8");
            res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
            return res.status(200).send(xml);
        }
        catch (error) {
            next(error);
        }
    }
    static async getSitemap(_req, res, next) {
        try {
            const xml = await feed_service_1.FeedService.generateSitemapXml();
            res.setHeader("Content-Type", "application/xml; charset=utf-8");
            res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
            return res.status(200).send(xml);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FeedController = FeedController;
