"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getOne = getOne;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.listPayments = listPayments;
exports.addPayment = addPayment;
const db_1 = require("../../config/db");
const AppError_1 = require("../../utils/AppError");
async function assertContactOwned(userId, contactId) {
    const contact = await (0, db_1.queryOne)(`SELECT id FROM contacts WHERE id = $1 AND user_id = $2`, [contactId, userId]);
    if (!contact)
        throw new AppError_1.AppError('Contact not found', 404);
}
async function list(userId, filters) {
    const conditions = ['user_id = $1'];
    const params = [userId];
    if (filters.status) {
        params.push(filters.status);
        conditions.push(`status = $${params.length}`);
    }
    if (filters.contact_id) {
        params.push(filters.contact_id);
        conditions.push(`contact_id = $${params.length}`);
    }
    if (filters.direction) {
        params.push(filters.direction);
        conditions.push(`direction = $${params.length}`);
    }
    return (0, db_1.query)(`SELECT * FROM debts WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`, params);
}
async function getOne(userId, id) {
    const debt = await (0, db_1.queryOne)(`SELECT * FROM debts WHERE id = $1 AND user_id = $2`, [id, userId]);
    if (!debt)
        throw new AppError_1.AppError('Debt not found', 404);
    return debt;
}
async function create(userId, input) {
    await assertContactOwned(userId, input.contact_id);
    const debt = await (0, db_1.queryOne)(`INSERT INTO debts (user_id, contact_id, direction, amount, currency, description, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [
        userId,
        input.contact_id,
        input.direction,
        input.amount,
        input.currency,
        input.description ?? null,
        input.due_date ?? null,
    ]);
    return debt;
}
async function update(userId, id, input) {
    await getOne(userId, id);
    if (input.contact_id)
        await assertContactOwned(userId, input.contact_id);
    const debt = await (0, db_1.queryOne)(`UPDATE debts SET
       contact_id  = COALESCE($3, contact_id),
       direction   = COALESCE($4, direction),
       amount      = COALESCE($5, amount),
       currency    = COALESCE($6, currency),
       description = COALESCE($7, description),
       due_date    = COALESCE($8, due_date),
       status      = COALESCE($9, status),
       updated_at  = now()
     WHERE id = $1 AND user_id = $2 RETURNING *`, [
        id,
        userId,
        input.contact_id ?? null,
        input.direction ?? null,
        input.amount ?? null,
        input.currency ?? null,
        input.description ?? null,
        input.due_date ?? null,
        input.status ?? null,
    ]);
    return debt;
}
async function remove(userId, id) {
    const rows = await (0, db_1.query)(`DELETE FROM debts WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    if (rows.length === 0)
        throw new AppError_1.AppError('Debt not found', 404);
}
// ── Payments ──────────────────────────────────────────────────────────────
async function listPayments(userId, debtId) {
    await getOne(userId, debtId); // ownership check
    return (0, db_1.query)(`SELECT * FROM payments WHERE debt_id = $1 AND user_id = $2 ORDER BY paid_at DESC`, [debtId, userId]);
}
async function addPayment(userId, debtId, input) {
    const debt = await getOne(userId, debtId);
    const payment = await (0, db_1.queryOne)(`INSERT INTO payments (debt_id, user_id, amount, note, paid_at)
     VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, now())) RETURNING *`, [debtId, userId, input.amount, input.note ?? null, input.paid_at ?? null]);
    // Recompute status from total payments.
    const paidRow = await (0, db_1.queryOne)(`SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE debt_id = $1`, [debtId]);
    const totalPaid = paidRow?.total_paid ?? 0;
    let status = 'pending';
    if (totalPaid >= debt.amount)
        status = 'paid';
    else if (totalPaid > 0)
        status = 'partial';
    const updated = await (0, db_1.queryOne)(`UPDATE debts SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`, [debtId, status]);
    return { payment: payment, debt: updated };
}
