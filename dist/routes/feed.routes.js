"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feed_controller_1 = require("../controllers/feed.controller");
const router = (0, express_1.Router)();
// Pinterest Auto-Pinning RSS Feed
router.get("/pinterest.xml", feed_controller_1.FeedController.getPinterestFeed);
router.get("/pinterest", feed_controller_1.FeedController.getPinterestFeed);
// Google SEO Sitemap
router.get("/sitemap.xml", feed_controller_1.FeedController.getSitemap);
router.get("/sitemap", feed_controller_1.FeedController.getSitemap);
exports.default = router;
