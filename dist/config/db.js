"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.queryOne = queryOne;
const pg_1 = require("pg");
const env_1 = require("./env");
// Postgres NUMERIC (oid 1700) comes back as a string by default.
// Parse it into a JS number so amounts/sums are easy to work with.
// NOTE: this uses floating point. Fine for an app like this; for banking-grade
// precision you would keep it as a string and use a decimal library.
pg_1.types.setTypeParser(1700, (val) => parseFloat(val));
const useSsl = env_1.env.PGSSL ||
    env_1.env.DATABASE_URL.includes('sslmode=require') ||
    env_1.env.DATABASE_URL.includes('neon.tech') ||
    env_1.env.DATABASE_URL.includes('supabase.co');
exports.pool = new pg_1.Pool({
    connectionString: env_1.env.DATABASE_URL || undefined,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});
/** Run a query and return all rows. */
async function query(text, params = []) {
    const result = await exports.pool.query(text, params);
    return result.rows;
}
/** Run a query and return the first row, or null. */
async function queryOne(text, params = []) {
    const rows = await query(text, params);
    return rows[0] ?? null;
}
