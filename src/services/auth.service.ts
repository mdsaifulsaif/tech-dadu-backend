import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { User, IUser } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
} from "../utils/jwt";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./email.service";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  // Register a new user with credentials
  static async register(name: string, email: string, password: string) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, "An account with this email already exists");
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { rawToken, hashedToken } = generateRandomToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "credentials",
      isVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpires: verificationExpires,
    });

    await sendVerificationEmail(email, name, rawToken);

    return {
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isVerified: newUser.isVerified,
    };
  }

  // Verify email address
  static async verifyEmail(token: string) {
    const hashed = hashToken(token);

    const user = await User.findOne({
      verificationToken: hashed,
      verificationTokenExpires: { $gt: new Date() },
    }).select("+verificationToken +verificationTokenExpires");

    if (!user) {
      throw new ApiError(400, "Invalid or expired verification token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return { email: user.email, isVerified: true };
  }

  // Resend verification email
  static async resendVerification(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found with this email");
    }

    if (user.isVerified) {
      throw new ApiError(400, "This email is already verified. You can log in.");
    }

    const { rawToken, hashedToken } = generateRandomToken();
    user.verificationToken = hashedToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.name, rawToken);
    return { email: user.email };
  }

  // Login with credentials
  static async login(email: string, password: string) {
    const user = await User.findOne({ email }).select(
      "+password +refreshTokens"
    );

    if (!user || !user.password) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isVerified) {
      throw new ApiError(
        403,
        "Please verify your email address before logging in. Check your inbox for the verification link."
      );
    }

    const tokenPayload = {
      userId: (user._id as any).toString(),
      role: user.role,
      email: user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const hashedRefreshToken = hashToken(refreshToken);
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
  static async googleAuth(params: {
    idToken?: string;
    email?: string;
    name?: string;
    image?: string;
    googleId?: string;
  }) {
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
      } catch (err) {
        throw new ApiError(401, "Invalid Google ID token");
      }
    }

    if (!email) {
      throw new ApiError(400, "Email could not be determined from Google account");
    }

    let user = await User.findOne({ email }).select("+refreshTokens");

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
    } else {
      // Create new verified user via Google
      user = await User.create({
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
      userId: (user._id as any).toString(),
      role: user.role,
      email: user.email,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const hashedRefreshToken = hashToken(refreshToken);
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
  static async refreshTokens(oldRefreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch (err) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(payload.userId).select("+refreshTokens");
    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    const hashedOldToken = hashToken(oldRefreshToken);
    const tokenIndex = user.refreshTokens.indexOf(hashedOldToken);

    // Reuse detection: if token is valid JWT but not in DB, clear all tokens
    if (tokenIndex === -1) {
      user.refreshTokens = [];
      await user.save();
      throw new ApiError(403, "Refresh token reuse detected. Please log in again.");
    }

    // Remove old token and rotate
    user.refreshTokens.splice(tokenIndex, 1);

    const tokenPayload = {
      userId: (user._id as any).toString(),
      role: user.role,
      email: user.email,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    user.refreshTokens.push(hashToken(newRefreshToken));
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // Logout - revokes refresh token
  static async logout(refreshToken?: string) {
    if (!refreshToken) return;

    try {
      const payload = verifyRefreshToken(refreshToken);
      const hashed = hashToken(refreshToken);
      await User.findByIdAndUpdate(payload.userId, {
        $pull: { refreshTokens: hashed },
      });
    } catch {
      // If invalid token, silently pass
    }
  }

  // Request password reset email
  static async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (!user || user.provider === "google") {
      return;
    }

    const { rawToken, hashedToken } = generateRandomToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendPasswordResetEmail(user.email, user.name, rawToken);
  }

  // Reset password using token
  static async resetPassword(rawToken: string, newPassword: string) {
    const hashed = hashToken(rawToken);

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password +resetPasswordToken +resetPasswordExpires +refreshTokens");

    if (!user) {
      throw new ApiError(400, "Invalid or expired password reset token");
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // Invalidate all active sessions for security
    user.refreshTokens = [];
    await user.save();

    return { email: user.email };
  }

  // Get current authenticated user profile
  static async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }
}

