import jwt from "jsonwebtoken";
import crypto from "crypto";

export interface ITokenPayload {
  userId: string;
  role: string;
  email: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret_tech_dadu_fallback_key";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret_tech_dadu_fallback_key";
const ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as any;
const REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as any;

export const generateAccessToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): ITokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as ITokenPayload;
};

export const verifyRefreshToken = (token: string): ITokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as ITokenPayload;
};

// Generates a random crypto hex string and its sha256 hash
export const generateRandomToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

