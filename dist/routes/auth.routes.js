"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Registration & Email Verification
router.post("/register", (0, validate_middleware_1.validate)(validate_middleware_1.registerSchema), auth_controller_1.AuthController.register);
router.get("/verify-email/:token", auth_controller_1.AuthController.verifyEmail);
router.post("/verify-email", auth_controller_1.AuthController.verifyEmail);
router.post("/resend-verification", (0, validate_middleware_1.validate)(validate_middleware_1.resendVerificationSchema), auth_controller_1.AuthController.resendVerification);
// Authentication & NextAuth Google Bridge
router.post("/login", (0, validate_middleware_1.validate)(validate_middleware_1.loginSchema), auth_controller_1.AuthController.login);
router.post("/google", (0, validate_middleware_1.validate)(validate_middleware_1.googleAuthSchema), auth_controller_1.AuthController.googleAuth);
router.post("/refresh", auth_controller_1.AuthController.refreshTokens);
router.post("/logout", auth_controller_1.AuthController.logout);
// Password Management
router.post("/forgot-password", (0, validate_middleware_1.validate)(validate_middleware_1.forgotPasswordSchema), auth_controller_1.AuthController.forgotPassword);
router.post("/reset-password/:token", (0, validate_middleware_1.validate)(validate_middleware_1.resetPasswordSchema), auth_controller_1.AuthController.resetPassword);
router.post("/reset-password", (0, validate_middleware_1.validate)(validate_middleware_1.resetPasswordSchema), auth_controller_1.AuthController.resetPassword);
// Protected Profile
router.get("/me", auth_middleware_1.authenticate, auth_controller_1.AuthController.getMe);
exports.default = router;
