import { Router } from "express";
import { DigitalProductController } from "../controllers/digitalProduct.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validate,
  createDigitalProductSchema,
  updateDigitalProductSchema,
} from "../middlewares/validate.middleware";

const router = Router();

// Public routes
router.get("/", DigitalProductController.getAll);
router.get("/id/:id", DigitalProductController.getById);
router.get("/:slug", DigitalProductController.getBySlug);

// Download / Live Demo Action Tracking
router.get("/:id/action", DigitalProductController.trackAction);
router.post("/:id/action", DigitalProductController.trackAction);

// Admin-only management routes
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createDigitalProductSchema),
  DigitalProductController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateDigitalProductSchema),
  DigitalProductController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  DigitalProductController.delete
);

export default router;

