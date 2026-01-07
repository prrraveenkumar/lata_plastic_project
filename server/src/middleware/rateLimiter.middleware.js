import ratelimit from "express-rate-limit";
import { ApiError } from "../utils/apiError.js";

export const rateLimiter = ratelimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: new ApiError(429, "Too many requests from this IP, please try again after 15 minutes"),
    handler: (req, res, next, options) => {
        next(new ApiError(options.statusCode, options.message));
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});


export const ocrRateLimiter = ratelimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    message: new ApiError(429, "Too many OCR requests from this IP, please try again after a minute"),
    handler: (req, res, next, options) => {
        next(new ApiError(options.statusCode, options.message));
    },
    standardHeaders: true,
    legacyHeaders: false,
});
