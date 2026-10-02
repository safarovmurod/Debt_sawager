"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
/** Requires a valid Bearer access token; attaches req.user. */
function authenticate(req, _res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        throw new AppError_1.AppError('Missing or invalid Authorization header', 401);
    }
    const token = header.slice('Bearer '.length);
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = { id: payload.sub, email: payload.email };
        next();
    }
    catch {
        throw new AppError_1.AppError('Invalid or expired access token', 401);
    }
}
