"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const app = (0, app_1.createApp)();
db_1.pool
    .query('SELECT 1')
    .then(() => console.log('✅ Database connected'))
    .catch((err) => console.error('⚠️  Database connection failed:', err.message));
const server = app.listen(env_1.env.PORT, () => {
    const url = env_1.env.SERVER_URL || `http://localhost:${env_1.env.PORT}`;
    console.log(`🚀 Server running on ${url} (${env_1.env.NODE_ENV})`);
});
async function shutdown(signal) {
    console.log(`\n${signal} received, shutting down...`);
    server.close();
    await db_1.pool.end();
    process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
