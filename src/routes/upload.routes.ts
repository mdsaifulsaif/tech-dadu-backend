import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { upload } from "../middlewares/upload.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Upload routes (protected for authenticated users or admins)
router.post(
  "/single",
  authenticate,
  upload.single("image"),
  UploadController.uploadSingle
);

router.post(
  "/multiple",
  authenticate,
  authorize("admin"),
  upload.array("images", 10), // Max 10 images at once
  UploadController.uploadMultiple
);

router.delete(
  "/:publicId",
  authenticate,
  authorize("admin"),
  UploadController.delete
);

export default router;

