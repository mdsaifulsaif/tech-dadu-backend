import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Admin-only analytics
router.get("/overview", authenticate, authorize("admin"), AnalyticsController.getOverview);

export default router;

