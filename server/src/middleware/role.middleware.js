import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Middleware to check if user has required role
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }

        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "Access denied. Insufficient permissions.");
        }

        next();
    });
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = authorize('admin');

/**
 * Middleware to check if user is admin or staff
 */
export const isAdminOrStaff = authorize('admin', 'staff');

/**
 * Middleware to check if user is client
 */
export const isClient = authorize('client');

