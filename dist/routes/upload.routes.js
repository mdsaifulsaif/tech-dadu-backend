"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Upload routes (protected for authenticated users or admins)
router.post("/single", auth_middleware_1.authenticate, upload_middleware_1.upload.single("image"), upload_controller_1.UploadController.uploadSingle);
router.post("/multiple", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), upload_middleware_1.upload.array("images", 10), // Max 10 images at once
upload_controller_1.UploadController.uploadMultiple);
router.delete("/:publicId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), upload_controller_1.UploadController.delete);
exports.default = router;
