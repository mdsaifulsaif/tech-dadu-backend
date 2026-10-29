import { Router } from "express";
import { FeedController } from "../controllers/feed.controller";

const router = Router();

// Pinterest Auto-Pinning RSS Feed
router.get("/pinterest.xml", FeedController.getPinterestFeed);
router.get("/pinterest", FeedController.getPinterestFeed);

// Google SEO Sitemap
router.get("/sitemap.xml", FeedController.getSitemap);
router.get("/sitemap", FeedController.getSitemap);

export default router;

