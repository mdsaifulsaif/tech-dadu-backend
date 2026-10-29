import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validate,
  createCategorySchema,
  updateCategorySchema,
} from "../middlewares/validate.middleware";

const router = Router();

// Public routes
router.get("/", CategoryController.getAll);
router.get("/:slug", CategoryController.getBySlug);

// Admin-only management routes
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createCategorySchema),
  CategoryController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateCategorySchema),
  CategoryController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  CategoryController.delete
);

export default router;

