"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * Wraps an async route handler so any thrown/rejected error is forwarded
 * to Express's error middleware instead of crashing the process.
 *
 * Use the generic to get a typed request, e.g. asyncHandler<AuthRequest>(...)
 */
const asyncHandler = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};
exports.asyncHandler = asyncHandler;
