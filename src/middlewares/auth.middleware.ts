import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken, ITokenPayload } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: ITokenPayload;
}

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required. Please provide a Bearer token.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      next(new ApiError(401, "Access token has expired. Please refresh your token."));
    } else if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, "Invalid access token"));
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "Forbidden. You do not have permission to access this resource.")
      );
    }

    next();
  };
};

