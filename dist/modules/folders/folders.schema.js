"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFolderSchema = exports.createFolderSchema = void 0;
const zod_1 = require("zod");
exports.createFolderSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120),
    color: zod_1.z.string().max(20).optional(),
});
exports.updateFolderSchema = exports.createFolderSchema.partial();
