import { Request, Response, NextFunction, CookieOptions } from "express";
import { AuthService } from "../services/auth.service";
import { sendResponse } from "../utils/response";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const isProduction = process.env.NODE_ENV === "production";

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register(name, email, password);

      return sendResponse(
        res,
        201,
        true,
        "Registration successful! Please check your email to verify your account.",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = (req.params.token || req.query.token) as string;
      const result = await AuthService.verifyEmail(token);

      return sendResponse(
        res,
        200,
        true,
        "Email verified successfully. You can now log in.",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await AuthService.resendVerification(email);

      return sendResponse(
        res,
        200,
        true,
        "Verification email resent successfully. Please check your inbox.",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login(
        email,
        password
      );

      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendResponse(res, 200, true, "Login successful", {
        user,
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await AuthService.googleAuth(
        req.body
      );

      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendResponse(res, 200, true, "Google authentication successful", {
        user,
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

      if (!incomingRefreshToken) {
        return sendResponse(res, 401, false, "Refresh token is missing");
      }

      const { accessToken, refreshToken } = await AuthService.refreshTokens(
        incomingRefreshToken
      );

      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendResponse(res, 200, true, "Token refreshed successfully", {
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

      await AuthService.logout(incomingRefreshToken);

      res.clearCookie("refreshToken", {
        ...REFRESH_COOKIE_OPTIONS,
        maxAge: 0,
      });

      return sendResponse(res, 200, true, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);

      return sendResponse(
        res,
        200,
        true,
        "If an account exists with this email, a password reset link has been sent."
      );
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token = (req.params.token || req.query.token || req.body.token) as string;
      const { password } = req.body;

      const result = await AuthService.resetPassword(token, password);

      return sendResponse(
        res,
        200,
        true,
        "Password has been reset successfully. You can now log in with your new password.",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.userId);

      return sendResponse(res, 200, true, "User profile retrieved", {
        user,
      });
    } catch (error) {
      next(error);
    }
  }
}

