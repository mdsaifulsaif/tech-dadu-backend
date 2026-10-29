"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get("/", product_controller_1.ProductController.getAll);
router.get("/id/:id", product_controller_1.ProductController.getById);
router.get("/:slug", product_controller_1.ProductController.getBySlug);
// Outbound Affiliate Click Tracking & Redirection
router.get("/:id/click", product_controller_1.ProductController.trackClick);
router.post("/:id/click", product_controller_1.ProductController.trackClick);
// Admin-only management routes
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(validate_middleware_1.createProductSchema), product_controller_1.ProductController.create);
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(validate_middleware_1.updateProductSchema), product_controller_1.ProductController.update);
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), product_controller_1.ProductController.delete);
exports.default = router;
