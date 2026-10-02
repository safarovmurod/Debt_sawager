"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const AppError_1 = require("../utils/AppError");
/** Validates and replaces req.body using a Zod schema. */
const validateBody = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const message = result.error.issues
            .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
            .join('; ');
        throw new AppError_1.AppError(message || 'Validation failed', 422);
    }
    req.body = result.data;
    next();
};
exports.validateBody = validateBody;
