"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getOne = getOne;
exports.create = create;
exports.update = update;
exports.remove = remove;
const db_1 = require("../../config/db");
const AppError_1 = require("../../utils/AppError");
async function assertFolderOwned(userId, folderId) {
    const folder = await (0, db_1.queryOne)(`SELECT id FROM folders WHERE id = $1 AND user_id = $2`, [folderId, userId]);
    if (!folder)
        throw new AppError_1.AppError('Folder not found', 404);
}
async function list(userId, folderId) {
    if (folderId) {
        return (0, db_1.query)(`SELECT * FROM contacts WHERE user_id = $1 AND folder_id = $2 ORDER BY name ASC`, [userId, folderId]);
    }
    return (0, db_1.query)(`SELECT * FROM contacts WHERE user_id = $1 ORDER BY name ASC`, [userId]);
}
async function getOne(userId, id) {
    const contact = await (0, db_1.queryOne)(`SELECT * FROM contacts WHERE id = $1 AND user_id = $2`, [id, userId]);
    if (!contact)
        throw new AppError_1.AppError('Contact not found', 404);
    return contact;
}
async function create(userId, input) {
    if (input.folder_id)
        await assertFolderOwned(userId, input.folder_id);
    const contact = await (0, db_1.queryOne)(`INSERT INTO contacts (user_id, folder_id, name, phone, email, note)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [
        userId,
        input.folder_id ?? null,
        input.name,
        input.phone ?? null,
        input.email ?? null,
        input.note ?? null,
    ]);
    return contact;
}
async function update(userId, id, input) {
    await getOne(userId, id);
    if (input.folder_id)
        await assertFolderOwned(userId, input.folder_id);
    const contact = await (0, db_1.queryOne)(`UPDATE contacts SET
       folder_id = COALESCE($3, folder_id),
       name = COALESCE($4, name),
       phone = COALESCE($5, phone),
       email = COALESCE($6, email),
       note = COALESCE($7, note),
       updated_at = now()
     WHERE id = $1 AND user_id = $2 RETURNING *`, [
        id,
        userId,
        input.folder_id ?? null,
        input.name ?? null,
        input.phone ?? null,
        input.email ?? null,
        input.note ?? null,
    ]);
    return contact;
}
async function remove(userId, id) {
    const rows = await (0, db_1.query)(`DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    if (rows.length === 0)
        throw new AppError_1.AppError('Contact not found', 404);
}
