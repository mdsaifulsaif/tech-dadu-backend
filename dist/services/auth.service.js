"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const user_model_1 = require("../models/user.model");
const ApiError_1 = require("../utils/ApiError");
const jwt_1 = require("../utils/jwt");
const email_service_1 = require("./email.service");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
class AuthService {
    // Register a new user with credentials
    static async register(name, email, password) {
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            throw new ApiError_1.ApiError(400, "An account with this email already exists");
        }
        const salt = await bcryptjs_1.default.genSalt(12);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const { rawCode, hashedCode } = (0, jwt_1.generate6DigitCode)();
        const verificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes
        const newUser = await user_model_1.User.create({
            name,
            email,
            password: hashedPassword,
            provider: "credentials",
            isVerified: false,
            verificationToken: hashedCode,
            verificationTokenExpires: verificationExpires,
        });
        await (0, email_service_1.sendVerificationEmail)(email, name, rawCode);
        return {
            userId: newUser._id,
            name: newUser.name,
            email: newUser.email,
            isVerified: newUser.isVerified,
        };
    }
    // Verify email address with 6-digit code or token
    static async verifyEmail(codeOrToken, email) {
        if (!codeOrToken) {
            throw new ApiError_1.ApiError(400, "6-digit verification code is required");
        }
        const hashed = (0, jwt_1.hashToken)(codeOrToken.trim());
        const filter = {
            verificationToken: hashed,
            verificationTokenExpires: { $gt: new Date() },
        };
        if (email) {
            filter.email = email.toLowerCase().trim();
        }
        let user = await user_model_1.User.findOne(filter).select("+verificationToken +verificationTokenExpires");
        if (!user && email) {
            user = await user_model_1.User.findOne({
                verificationToken: hashed,
                verificationTokenExpires: { $gt: new Date() },
            }).select("+verificationToken +verificationTokenExpires");
        }
        if (!user) {
            throw new ApiError_1.ApiError(400, "Invalid or expired 6-digit verification code");
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();
        return { email: user.email, isVerified: true };
    }
    // Resend verification email
    static async resendVerification(email) {
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            throw new ApiError_1.ApiError(404, "User not found with this email");
        }
        if (user.isVerified) {
            throw new ApiError_1.ApiError(400, "This email is already verified. You can log in.");
        }
        const { rawCode, hashedCode } = (0, jwt_1.generate6DigitCode)();
        user.verificationToken = hashedCode;
        user.verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();
        await (0, email_service_1.sendVerificationEmail)(user.email, user.name, rawCode);
        return { email: user.email };
    }
    // Login with credentials
    static async login(email, password) {
        const user = await user_model_1.User.findOne({ email }).select("+password +refreshTokens");
        if (!user || !user.password) {
            throw new ApiError_1.ApiError(401, "Invalid email or password");
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new ApiError_1.ApiError(401, "Invalid email or password");
        }
        if (!user.isVerified) {
            throw new ApiError_1.ApiError(403, "Please verify your email address before logging in. Check your inbox for the verification link.");
        }
        const tokenPayload = {
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
        const hashedRefreshToken = (0, jwt_1.hashToken)(refreshToken);
        user.refreshTokens.push(hashedRefreshToken);
        await user.save();
        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isVerified: user.isVerified,
            },
            accessToken,
            refreshToken,
        };
    }
    // Google OAuth Login / NextAuth Integration
    static async googleAuth(params) {
        let email = params.email;
        let name = params.name || "Google User";
        let avatar = params.image || "";
        let googleId = params.googleId;
        // If idToken is provided, verify directly with Google
        if (params.idToken && process.env.GOOGLE_CLIENT_ID) {
            try {
                const ticket = await googleClient.verifyIdToken({
                    idToken: params.idToken,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                if (payload && payload.email) {
                    email = payload.email;
                    name = payload.name || name;
                    avatar = payload.picture || avatar;
                    googleId = payload.sub;
                }
            }
            catch (err) {
                throw new ApiError_1.ApiError(401, "Invalid Google ID token");
            }
        }
        if (!email) {
            throw new ApiError_1.ApiError(400, "Email could not be determined from Google account");
        }
        let user = await user_model_1.User.findOne({ email }).select("+refreshTokens");
        if (user) {
            // If user exists, link Google ID and mark verified if not already
            if (!user.googleId && googleId) {
                user.googleId = googleId;
            }
            if (!user.isVerified) {
                user.isVerified = true;
            }
            if (!user.avatar && avatar) {
                user.avatar = avatar;
            }
        }
        else {
            // Create new verified user via Google
            user = await user_model_1.User.create({
                name,
                email,
                avatar,
                googleId,
                provider: "google",
                isVerified: true,
                refreshTokens: [],
            });
        }
        const tokenPayload = {
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
        const hashedRefreshToken = (0, jwt_1.hashToken)(refreshToken);
        user.refreshTokens.push(hashedRefreshToken);
        await user.save();
        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isVerified: user.isVerified,
            },
            accessToken,
            refreshToken,
        };
    }
    // Refresh tokens with rotation and reuse detection
    static async refreshTokens(oldRefreshToken) {
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(oldRefreshToken);
        }
        catch (err) {
            throw new ApiError_1.ApiError(401, "Invalid or expired refresh token");
        }
        const user = await user_model_1.User.findById(payload.userId).select("+refreshTokens");
        if (!user) {
            throw new ApiError_1.ApiError(401, "User no longer exists");
        }
        const hashedOldToken = (0, jwt_1.hashToken)(oldRefreshToken);
        const tokenIndex = user.refreshTokens.indexOf(hashedOldToken);
        // Reuse detection: if token is valid JWT but not in DB, clear all tokens
        if (tokenIndex === -1) {
            user.refreshTokens = [];
            await user.save();
            throw new ApiError_1.ApiError(403, "Refresh token reuse detected. Please log in again.");
        }
        // Remove old token and rotate
        user.refreshTokens.splice(tokenIndex, 1);
        const tokenPayload = {
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        };
        const newAccessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
        user.refreshTokens.push((0, jwt_1.hashToken)(newRefreshToken));
        await user.save();
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
    // Logout - revokes refresh token
    static async logout(refreshToken) {
        if (!refreshToken)
            return;
        try {
            const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
            const hashed = (0, jwt_1.hashToken)(refreshToken);
            await user_model_1.User.findByIdAndUpdate(payload.userId, {
                $pull: { refreshTokens: hashed },
            });
        }
        catch {
            // If invalid token, silently pass
        }
    }
    // Request password reset email
    static async forgotPassword(email) {
        const user = await user_model_1.User.findOne({ email });
        // Always return success to prevent email enumeration
        if (!user || user.provider === "google") {
            return;
        }
        const { rawToken, hashedToken } = (0, jwt_1.generateRandomToken)();
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();
        await (0, email_service_1.sendPasswordResetEmail)(user.email, user.name, rawToken);
    }
    // Reset password using token
    static async resetPassword(rawToken, newPassword) {
        const hashed = (0, jwt_1.hashToken)(rawToken);
        const user = await user_model_1.User.findOne({
            resetPasswordToken: hashed,
            resetPasswordExpires: { $gt: new Date() },
        }).select("+password +resetPasswordToken +resetPasswordExpires +refreshTokens");
        if (!user) {
            throw new ApiError_1.ApiError(400, "Invalid or expired password reset token");
        }
        const salt = await bcryptjs_1.default.genSalt(12);
        user.password = await bcryptjs_1.default.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        // Invalidate all active sessions for security
        user.refreshTokens = [];
        await user.save();
        return { email: user.email };
    }
    // Get current authenticated user profile
    static async getMe(userId) {
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            throw new ApiError_1.ApiError(404, "User not found");
        }
        return user;
    }
}
exports.AuthService = AuthService;
