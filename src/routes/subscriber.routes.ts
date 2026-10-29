import { Router } from "express";
import { SubscriberController } from "../controllers/subscriber.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validate,
  subscribeSchema,
  broadcastSchema,
} from "../middlewares/validate.middleware";

const router = Router();

// Public routes
router.post("/subscribe", validate(subscribeSchema), SubscriberController.subscribe);
router.post("/unsubscribe", SubscriberController.unsubscribe);

// Admin-only newsletter management
router.get("/", authenticate, authorize("admin"), SubscriberController.getAll);
router.post(
  "/broadcast",
  authenticate,
  authorize("admin"),
  validate(broadcastSchema),
  SubscriberController.broadcast
);

export default router;

