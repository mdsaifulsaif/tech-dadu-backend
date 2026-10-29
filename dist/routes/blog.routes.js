"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = require("../controllers/blog.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get("/", blog_controller_1.BlogController.getAll);
router.get("/id/:id", blog_controller_1.BlogController.getById);
router.get("/:id/related", blog_controller_1.BlogController.getRelated);
router.get("/:slug", blog_controller_1.BlogController.getBySlug);
// Admin-only management routes
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(validate_middleware_1.createBlogSchema), blog_controller_1.BlogController.create);
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(validate_middleware_1.updateBlogSchema), blog_controller_1.BlogController.update);
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), blog_controller_1.BlogController.delete);
exports.default = router;
