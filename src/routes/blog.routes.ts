import { Router } from "express";
import { BlogController } from "../controllers/blog.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  validate,
  createBlogSchema,
  updateBlogSchema,
} from "../middlewares/validate.middleware";

const router = Router();

// Public routes
router.get("/", BlogController.getAll);
router.get("/id/:id", BlogController.getById);
router.get("/:id/related", BlogController.getRelated);
router.get("/:slug", BlogController.getBySlug);

// Admin-only management routes
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createBlogSchema),
  BlogController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateBlogSchema),
  BlogController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  BlogController.delete
);

export default router;

