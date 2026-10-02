"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
exports.env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: parseInt(process.env.PORT ?? '4000', 10),
    DATABASE_URL: process.env.DATABASE_URL ?? '',
    PGSSL: (process.env.PGSSL ?? 'false') === 'true',
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'debt_tracker_jwt_access_secret_production_key_2026',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'debt_tracker_jwt_refresh_secret_production_key_2026',
    ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL ?? '2h',
    REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL ?? '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
    SERVER_URL: process.env.SERVER_URL ?? '',
};
