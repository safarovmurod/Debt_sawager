"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const db_1 = require("../config/db");
async function migrate() {
    const schemaPath = (0, path_1.join)(__dirname, 'schema.sql');
    const sql = (0, fs_1.readFileSync)(schemaPath, 'utf-8');
    await db_1.pool.query(sql);
    console.log('✅ Migration complete');
    await db_1.pool.end();
}
migrate().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
