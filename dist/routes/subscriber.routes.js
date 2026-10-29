"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriber_controller_1 = require("../controllers/subscriber.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post("/subscribe", (0, validate_middleware_1.validate)(validate_middleware_1.subscribeSchema), subscriber_controller_1.SubscriberController.subscribe);
router.post("/unsubscribe", subscriber_controller_1.SubscriberController.unsubscribe);
// Admin-only newsletter management
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), subscriber_controller_1.SubscriberController.getAll);
router.post("/broadcast", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("admin"), (0, validate_middleware_1.validate)(validate_middleware_1.broadcastSchema), subscriber_controller_1.SubscriberController.broadcast);
exports.default = router;
