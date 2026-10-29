"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const siteSetting_controller_1 = require("../controllers/siteSetting.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public: Frontend reads GTM ID, Meta Pixel ID, Site Name, SEO info
router.get("/", siteSetting_controller_1.SiteSettingController.get);
// Admin-only: Update GTM ID, Pinterest verification, Google verification, social links etc.
router.put("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), siteSetting_controller_1.SiteSettingController.update);
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), siteSetting_controller_1.SiteSettingController.update);
exports.default = router;
