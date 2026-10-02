"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getById = getById;
exports.updateProfile = updateProfile;
const db_1 = require("../../config/db");
const AppError_1 = require("../../utils/AppError");
async function getById(id) {
    const user = await (0, db_1.queryOne)(`SELECT id, name, email, created_at FROM users WHERE id = $1`, [id]);
    if (!user)
        throw new AppError_1.AppError('User not found', 404);
    return user;
}
async function updateProfile(id, data) {
    const user = await (0, db_1.queryOne)(`UPDATE users SET name = COALESCE($2, name), updated_at = now()
     WHERE id = $1 RETURNING id, name, email, created_at`, [id, data.name ?? null]);
    if (!user)
        throw new AppError_1.AppError('User not found', 404);
    return user;
}
