import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  googleAuthSchema,
} from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Registration & Email Verification
router.post("/register", validate(registerSchema), AuthController.register);
router.get("/verify-email/:token", AuthController.verifyEmail);
router.post("/verify-email", AuthController.verifyEmail);
router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  AuthController.resendVerification
);

// Authentication & NextAuth Google Bridge
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/google", validate(googleAuthSchema), AuthController.googleAuth);
router.post("/refresh", AuthController.refreshTokens);
router.post("/logout", AuthController.logout);

// Password Management
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
);
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  AuthController.resetPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

// Protected Profile
router.get("/me", authenticate, AuthController.getMe);

export default router;

