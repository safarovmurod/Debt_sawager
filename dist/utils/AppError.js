"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
/** An error with an attached HTTP status code, handled by the error middleware. */
class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
