"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
const AppError_1 = require("../utils/AppError");
const env_1 = require("../config/env");
/** 404 handler for unmatched routes. */
function notFound(_req, res) {
    res.status(404).json({ error: 'Route not found' });
}
/** Central error handler. Must keep all 4 args for Express to recognise it. */
function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError_1.AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    // Postgres unique_violation
    const pgErr = err;
    if (pgErr.code === '23505') {
        res.status(409).json({ error: 'Resource already exists' });
        return;
    }
    console.error(err);
    res.status(500).json({
        error: 'Internal server error',
        ...(env_1.env.NODE_ENV !== 'production' ? { detail: String(err) } : {}),
    });
}
