"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const ApiError_1 = require("../utils/ApiError");
const jwt_1 = require("../utils/jwt");
const authenticate = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError_1.ApiError(401, "Authentication required. Please provide a Bearer token.");
        }
        const token = authHeader.split(" ")[1];
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            next(new ApiError_1.ApiError(401, "Access token has expired. Please refresh your token."));
        }
        else if (error instanceof ApiError_1.ApiError) {
            next(error);
        }
        else {
            next(new ApiError_1.ApiError(401, "Invalid access token"));
        }
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new ApiError_1.ApiError(401, "Unauthorized"));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ApiError_1.ApiError(403, "Forbidden. You do not have permission to access this resource."));
        }
        next();
    };
};
exports.authorize = authorize;
