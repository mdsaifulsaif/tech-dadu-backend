import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validate,
  createProductSchema,
  updateProductSchema,
} from "../middlewares/validate.middleware";

const router = Router();

// Public routes
router.get("/", ProductController.getAll);
router.get("/id/:id", ProductController.getById);
router.get("/:slug", ProductController.getBySlug);

// Outbound Affiliate Click Tracking & Redirection
router.get("/:id/click", ProductController.trackClick);
router.post("/:id/click", ProductController.trackClick);

// Admin-only management routes
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createProductSchema),
  ProductController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateProductSchema),
  ProductController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  ProductController.delete
);

export default router;

