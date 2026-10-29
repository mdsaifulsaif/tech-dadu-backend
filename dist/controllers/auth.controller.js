"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../utils/response");
const isProduction = process.env.NODE_ENV === "production";
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
};
class AuthController {
    static async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const result = await auth_service_1.AuthService.register(name, email, password);
            return (0, response_1.sendResponse)(res, 201, true, "Registration successful! Please check your email to verify your account.", result);
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyEmail(req, res, next) {
        try {
            const token = (req.params.token || req.query.token);
            const result = await auth_service_1.AuthService.verifyEmail(token);
            return (0, response_1.sendResponse)(res, 200, true, "Email verified successfully. You can now log in.", result);
        }
        catch (error) {
            next(error);
        }
    }
    static async resendVerification(req, res, next) {
        try {
            const { email } = req.body;
            const result = await auth_service_1.AuthService.resendVerification(email);
            return (0, response_1.sendResponse)(res, 200, true, "Verification email resent successfully. Please check your inbox.", result);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { user, accessToken, refreshToken } = await auth_service_1.AuthService.login(email, password);
            res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
            return (0, response_1.sendResponse)(res, 200, true, "Login successful", {
                user,
                accessToken,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async googleAuth(req, res, next) {
        try {
            const { user, accessToken, refreshToken } = await auth_service_1.AuthService.googleAuth(req.body);
            res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
            return (0, response_1.sendResponse)(res, 200, true, "Google authentication successful", {
                user,
                accessToken,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async refreshTokens(req, res, next) {
        try {
            const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
            if (!incomingRefreshToken) {
                return (0, response_1.sendResponse)(res, 401, false, "Refresh token is missing");
            }
            const { accessToken, refreshToken } = await auth_service_1.AuthService.refreshTokens(incomingRefreshToken);
            res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
            return (0, response_1.sendResponse)(res, 200, true, "Token refreshed successfully", {
                accessToken,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
            await auth_service_1.AuthService.logout(incomingRefreshToken);
            res.clearCookie("refreshToken", {
                ...REFRESH_COOKIE_OPTIONS,
                maxAge: 0,
            });
            return (0, response_1.sendResponse)(res, 200, true, "Logged out successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            await auth_service_1.AuthService.forgotPassword(email);
            return (0, response_1.sendResponse)(res, 200, true, "If an account exists with this email, a password reset link has been sent.");
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const token = (req.params.token || req.query.token || req.body.token);
            const { password } = req.body;
            const result = await auth_service_1.AuthService.resetPassword(token, password);
            return (0, response_1.sendResponse)(res, 200, true, "Password has been reset successfully. You can now log in with your new password.", result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMe(req, res, next) {
        try {
            const user = await auth_service_1.AuthService.getMe(req.user.userId);
            return (0, response_1.sendResponse)(res, 200, true, "User profile retrieved", {
                user,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
