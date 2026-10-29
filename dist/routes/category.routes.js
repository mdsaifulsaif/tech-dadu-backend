"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get("/", category_controller_1.CategoryController.getAll);
router.get("/:slug", category_controller_1.CategoryController.getBySlug);
// Admin-only management routes
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(validate_middleware_1.createCategorySchema), category_controller_1.CategoryController.create);
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(validate_middleware_1.updateCategorySchema), category_controller_1.CategoryController.update);
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), category_controller_1.CategoryController.delete);
exports.default = router;
