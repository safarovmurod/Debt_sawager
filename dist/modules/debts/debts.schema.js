"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentSchema = exports.updateDebtSchema = exports.createDebtSchema = void 0;
const zod_1 = require("zod");
const isoDate = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD');
exports.createDebtSchema = zod_1.z.object({
    contact_id: zod_1.z.string().uuid(),
    direction: zod_1.z.enum(['they_owe_me', 'i_owe_them']),
    amount: zod_1.z.number().positive().max(1_000_000_000),
    currency: zod_1.z.string().min(1).max(8).default('USD'),
    description: zod_1.z.string().max(1000).optional(),
    due_date: isoDate.optional(),
});
exports.updateDebtSchema = zod_1.z.object({
    contact_id: zod_1.z.string().uuid().optional(),
    direction: zod_1.z.enum(['they_owe_me', 'i_owe_them']).optional(),
    amount: zod_1.z.number().positive().max(1_000_000_000).optional(),
    currency: zod_1.z.string().min(1).max(8).optional(),
    description: zod_1.z.string().max(1000).optional(),
    due_date: isoDate.optional(),
    status: zod_1.z.enum(['pending', 'partial', 'paid']).optional(),
});
exports.createPaymentSchema = zod_1.z.object({
    amount: zod_1.z.number().positive().max(1_000_000_000),
    note: zod_1.z.string().max(500).optional(),
    paid_at: zod_1.z.string().optional(),
});
