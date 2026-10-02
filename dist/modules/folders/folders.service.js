"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getOne = getOne;
exports.create = create;
exports.update = update;
exports.remove = remove;
const db_1 = require("../../config/db");
const AppError_1 = require("../../utils/AppError");
async function list(userId) {
    return (0, db_1.query)(`SELECT * FROM folders WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
}
async function getOne(userId, id) {
    const folder = await (0, db_1.queryOne)(`SELECT * FROM folders WHERE id = $1 AND user_id = $2`, [id, userId]);
    if (!folder)
        throw new AppError_1.AppError('Folder not found', 404);
    return folder;
}
async function create(userId, input) {
    const folder = await (0, db_1.queryOne)(`INSERT INTO folders (user_id, name, color) VALUES ($1, $2, $3) RETURNING *`, [userId, input.name, input.color ?? null]);
    return folder;
}
async function update(userId, id, input) {
    await getOne(userId, id); // verify ownership / existence
    const folder = await (0, db_1.queryOne)(`UPDATE folders SET
       name = COALESCE($3, name),
       color = COALESCE($4, color),
       updated_at = now()
     WHERE id = $1 AND user_id = $2 RETURNING *`, [id, userId, input.name ?? null, input.color ?? null]);
    return folder;
}
async function remove(userId, id) {
    const rows = await (0, db_1.query)(`DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    if (rows.length === 0)
        throw new AppError_1.AppError('Folder not found', 404);
}
