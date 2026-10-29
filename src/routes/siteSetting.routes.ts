import { Router } from "express";
import { SiteSettingController } from "../controllers/siteSetting.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Public: Frontend reads GTM ID, Meta Pixel ID, Site Name, SEO info
router.get("/", SiteSettingController.get);

// Admin-only: Update GTM ID, Pinterest verification, Google verification, social links etc.
router.put("/", authenticate, authorize("admin"), SiteSettingController.update);
router.post("/", authenticate, authorize("admin"), SiteSettingController.update);

export default router;

