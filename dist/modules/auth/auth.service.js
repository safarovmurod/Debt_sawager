"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
const crypto_1 = require("crypto");
const db_1 = require("../../config/db");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const AppError_1 = require("../../utils/AppError");
const env_1 = require("../../config/env");
function toPublic(u) {
    return { id: u.id, name: u.name, email: u.email, created_at: u.created_at };
}
/** Convert a TTL string like "7d" / "15m" / "30s" / "12h" to milliseconds. */
function ttlToMs(ttl) {
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match)
        return 7 * 24 * 60 * 60 * 1000; // default 7 days
    const n = parseInt(match[1], 10);
    const unit = match[2];
    const mult = unit === 's' ? 1000 : unit === 'm' ? 60000 : unit === 'h' ? 3600000 : 86400000;
    return n * mult;
}
async function issueTokens(user) {
    const accessToken = (0, jwt_1.signAccessToken)({ sub: user.id, email: user.email });
    const jti = (0, crypto_1.randomUUID)();
    const refreshToken = (0, jwt_1.signRefreshToken)({ sub: user.id, jti });
    const expiresAt = new Date(Date.now() + ttlToMs(env_1.env.REFRESH_TOKEN_TTL));
    await (0, db_1.query)(`INSERT INTO refresh_tokens (id, user_id, expires_at) VALUES ($1, $2, $3)`, [jti, user.id, expiresAt]);
    return { accessToken, refreshToken };
}
async function register(input) {
    const existing = await (0, db_1.queryOne)(`SELECT * FROM users WHERE email = $1`, [input.email]);
    if (existing)
        throw new AppError_1.AppError('Email already registered', 409);
    const passwordHash = await (0, password_1.hashPassword)(input.password);
    const user = await (0, db_1.queryOne)(`INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *`, [input.name, input.email, passwordHash]);
    if (!user)
        throw new AppError_1.AppError('Failed to create user', 500);
    const tokens = await issueTokens(user);
    return { user: toPublic(user), ...tokens };
}
async function login(input) {
    const user = await (0, db_1.queryOne)(`SELECT * FROM users WHERE email = $1`, [input.email]);
    if (!user)
        throw new AppError_1.AppError('Invalid email or password', 401);
    const ok = await (0, password_1.comparePassword)(input.password, user.password_hash);
    if (!ok)
        throw new AppError_1.AppError('Invalid email or password', 401);
    const tokens = await issueTokens(user);
    return { user: toPublic(user), ...tokens };
}
async function refresh(token) {
    let payload;
    try {
        payload = (0, jwt_1.verifyRefreshToken)(token);
    }
    catch {
        throw new AppError_1.AppError('Invalid or expired refresh token', 401);
    }
    const stored = await (0, db_1.queryOne)(`SELECT id, user_id, revoked, expires_at FROM refresh_tokens WHERE id = $1`, [payload.jti]);
    if (!stored || stored.revoked)
        throw new AppError_1.AppError('Refresh token revoked', 401);
    if (new Date(stored.expires_at) < new Date())
        throw new AppError_1.AppError('Refresh token expired', 401);
    // Rotate: revoke the used token, issue a fresh pair.
    await (0, db_1.query)(`UPDATE refresh_tokens SET revoked = true WHERE id = $1`, [payload.jti]);
    const user = await (0, db_1.queryOne)(`SELECT * FROM users WHERE id = $1`, [payload.sub]);
    if (!user)
        throw new AppError_1.AppError('User not found', 401);
    return issueTokens(user);
}
async function logout(token) {
    try {
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        await (0, db_1.query)(`UPDATE refresh_tokens SET revoked = true WHERE id = $1`, [payload.jti]);
    }
    catch {
        // Token already invalid — nothing to revoke.
    }
}
