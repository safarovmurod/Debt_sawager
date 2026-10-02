"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactSchema = exports.createContactSchema = void 0;
const zod_1 = require("zod");
exports.createContactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120),
    phone: zod_1.z.string().max(40).optional(),
    email: zod_1.z.string().email().optional(),
    note: zod_1.z.string().max(1000).optional(),
    folder_id: zod_1.z.string().uuid().optional(),
});
exports.updateContactSchema = exports.createContactSchema.partial();
