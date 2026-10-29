"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const digitalProduct_controller_1 = require("../controllers/digitalProduct.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get("/", digitalProduct_controller_1.DigitalProductController.getAll);
router.get("/id/:id", digitalProduct_controller_1.DigitalProductController.getById);
router.get("/:slug", digitalProduct_controller_1.DigitalProductController.getBySlug);
// Download / Live Demo Action Tracking
router.get("/:id/action", digitalProduct_controller_1.DigitalProductController.trackAction);
router.post("/:id/action", digitalProduct_controller_1.DigitalProductController.trackAction);
// Admin-only management routes
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(validate_middleware_1.createDigitalProductSchema), digitalProduct_controller_1.DigitalProductController.create);
router.put("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(validate_middleware_1.updateDigitalProductSchema), digitalProduct_controller_1.DigitalProductController.update);
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), digitalProduct_controller_1.DigitalProductController.delete);
exports.default = router;
