"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express7 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_morgan = __toESM(require("morgan"));

// src/config/env.ts
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  PGSSL: (process.env.PGSSL ?? "false") === "true",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "debt_tracker_jwt_access_secret_production_key_2026",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "debt_tracker_jwt_refresh_secret_production_key_2026",
  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL ?? "2h",
  REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL ?? "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
  SERVER_URL: process.env.SERVER_URL ?? ""
};

// src/docs/openapi.ts
var openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Debt Tracker API",
    version: "1.0.0",
    description: "Backend API for tracking debts between you and your contacts (Node.js + TypeScript + PostgreSQL).",
    license: { name: "MIT" }
  },
  servers: [
    { url: "/", description: "Current environment (Automatic)" },
    ...env.SERVER_URL ? [{ url: env.SERVER_URL, description: "Configured server" }] : []
  ],
  tags: [
    { name: "Auth", description: "Registration, login, token refresh & logout" },
    { name: "Users", description: "Current user profile" },
    { name: "Folders", description: "Groups of contacts" },
    { name: "Contacts", description: "People you owe / who owe you" },
    { name: "Debts", description: "Debts and their payments" },
    { name: "Dashboard", description: "Aggregated summary" },
    { name: "System", description: "Service health" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token returned by /api/auth/login or /api/auth/register."
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Invalid email or password" },
          detail: {
            type: "string",
            description: "Only present in non-production environments for 500 errors."
          }
        },
        required: ["error"]
      },
      ValidationError: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: 'Semicolon-separated "field: message" pairs.',
            example: "email: Invalid email; password: String must contain at least 6 character(s)"
          }
        },
        required: ["error"]
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          created_at: { type: "string", format: "date-time" }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          accessToken: { type: "string", description: "JWT access token" },
          refreshToken: { type: "string", description: "JWT refresh token" }
        }
      },
      Tokens: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" }
        }
      },
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 120, example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          password: { type: "string", minLength: 6, maxLength: 128, example: "secret123" }
        }
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "jane@example.com" },
          password: { type: "string", minLength: 1, example: "secret123" }
        }
      },
      RefreshInput: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string", minLength: 10 }
        }
      },
      Folder: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          user_id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Family" },
          color: { type: "string", nullable: true, example: "#ff8800" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" }
        }
      },
      FolderInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 120, example: "Family" },
          color: { type: "string", maxLength: 20, example: "#ff8800" }
        }
      },
      Contact: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          user_id: { type: "string", format: "uuid" },
          folder_id: { type: "string", format: "uuid", nullable: true },
          name: { type: "string", example: "John Smith" },
          phone: { type: "string", nullable: true, example: "+1 555 0100" },
          email: { type: "string", format: "email", nullable: true },
          note: { type: "string", nullable: true },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" }
        }
      },
      ContactInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 120, example: "John Smith" },
          phone: { type: "string", maxLength: 40, example: "+1 555 0100" },
          email: { type: "string", format: "email" },
          note: { type: "string", maxLength: 1e3 },
          folder_id: { type: "string", format: "uuid" }
        }
      },
      Debt: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          user_id: { type: "string", format: "uuid" },
          contact_id: { type: "string", format: "uuid" },
          direction: { type: "string", enum: ["they_owe_me", "i_owe_them"] },
          amount: { type: "number", format: "double", example: 150 },
          currency: { type: "string", example: "USD" },
          description: { type: "string", nullable: true },
          due_date: { type: "string", format: "date", nullable: true, example: "2026-07-01" },
          status: { type: "string", enum: ["pending", "partial", "paid"] },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" }
        }
      },
      CreateDebtInput: {
        type: "object",
        required: ["contact_id", "direction", "amount"],
        properties: {
          contact_id: { type: "string", format: "uuid" },
          direction: { type: "string", enum: ["they_owe_me", "i_owe_them"] },
          amount: { type: "number", format: "double", minimum: 0, exclusiveMinimum: true, maximum: 1e9, example: 150 },
          currency: { type: "string", minLength: 1, maxLength: 8, default: "USD" },
          description: { type: "string", maxLength: 1e3 },
          due_date: { type: "string", format: "date", example: "2026-07-01" }
        }
      },
      UpdateDebtInput: {
        type: "object",
        properties: {
          contact_id: { type: "string", format: "uuid" },
          direction: { type: "string", enum: ["they_owe_me", "i_owe_them"] },
          amount: { type: "number", format: "double", minimum: 0, exclusiveMinimum: true, maximum: 1e9 },
          currency: { type: "string", minLength: 1, maxLength: 8 },
          description: { type: "string", maxLength: 1e3 },
          due_date: { type: "string", format: "date" },
          status: { type: "string", enum: ["pending", "partial", "paid"] }
        }
      },
      Payment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          debt_id: { type: "string", format: "uuid" },
          user_id: { type: "string", format: "uuid" },
          amount: { type: "number", format: "double", example: 50 },
          note: { type: "string", nullable: true },
          paid_at: { type: "string", format: "date-time" },
          created_at: { type: "string", format: "date-time" }
        }
      },
      CreatePaymentInput: {
        type: "object",
        required: ["amount"],
        properties: {
          amount: { type: "number", format: "double", minimum: 0, exclusiveMinimum: true, maximum: 1e9, example: 50 },
          note: { type: "string", maxLength: 500 },
          paid_at: { type: "string", format: "date-time", description: "Defaults to now if omitted." }
        }
      },
      DashboardSummary: {
        type: "object",
        properties: {
          totals: {
            type: "object",
            properties: {
              they_owe_me: { type: "number", format: "double" },
              i_owe_them: { type: "number", format: "double" }
            }
          },
          outstanding: {
            type: "object",
            properties: {
              they_owe_me: { type: "number", format: "double" },
              i_owe_them: { type: "number", format: "double" },
              net_balance: { type: "number", format: "double", description: "Positive => net owed to you." }
            }
          },
          counts: {
            type: "object",
            properties: {
              pending: { type: "integer" },
              partial: { type: "integer" },
              paid: { type: "integer" },
              total: { type: "integer" }
            }
          },
          contacts_count: { type: "integer" },
          upcoming_due: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                amount: { type: "number", format: "double" },
                currency: { type: "string" },
                direction: { type: "string", enum: ["they_owe_me", "i_owe_them"] },
                due_date: { type: "string", format: "date", nullable: true },
                status: { type: "string", enum: ["pending", "partial", "paid"] },
                contact_name: { type: "string" }
              }
            }
          }
        }
      }
    },
    responses: {
      Unauthorized: {
        description: "Missing or invalid access token",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
      },
      NotFound: {
        description: "Resource not found",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
      },
      ValidationFailed: {
        description: "Request body failed validation (HTTP 422)",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } }
      }
    },
    parameters: {
      IdPath: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Resource UUID"
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        security: [],
        responses: {
          200: {
            description: "Service is up",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    time: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterInput" } } }
        },
        responses: {
          201: {
            description: "User created with tokens",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } }
          },
          409: { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          422: { $ref: "#/components/responses/ValidationFailed" }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } }
        },
        responses: {
          200: {
            description: "Authenticated with tokens",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } }
          },
          401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          422: { $ref: "#/components/responses/ValidationFailed" }
        }
      }
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate refresh token",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshInput" } } }
        },
        responses: {
          200: {
            description: "New token pair",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Tokens" } } }
          },
          401: { description: "Invalid, expired or revoked refresh token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke a refresh token",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshInput" } } }
        },
        responses: {
          200: {
            description: "Logged out",
            content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "Logged out" } } } } }
          }
        }
      }
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user",
        responses: {
          200: { description: "Current user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          401: { $ref: "#/components/responses/Unauthorized" }
        }
      },
      patch: {
        tags: ["Users"],
        summary: "Update current user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["name"], properties: { name: { type: "string", minLength: 1, maxLength: 120 } } }
            }
          }
        },
        responses: {
          200: { description: "Updated user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          422: { $ref: "#/components/responses/ValidationFailed" }
        }
      }
    },
    "/api/folders": {
      get: {
        tags: ["Folders"],
        summary: "List folders",
        responses: {
          200: { description: "Array of folders", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Folder" } } } } },
          401: { $ref: "#/components/responses/Unauthorized" }
        }
      },
      post: {
        tags: ["Folders"],
        summary: "Create a folder",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/FolderInput" } } } },
        responses: {
          201: { description: "Created folder", content: { "application/json": { schema: { $ref: "#/components/schemas/Folder" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          422: { $ref: "#/components/responses/ValidationFailed" }
        }
      }
    },
    "/api/folders/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdPath" }],
      get: {
        tags: ["Folders"],
        summary: "Get a folder",
        responses: {
          200: { description: "Folder", content: { "application/json": { schema: { $ref: "#/components/schemas/Folder" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      },
      patch: {
        tags: ["Folders"],
        summary: "Update a folder",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/FolderInput" } } } },
        responses: {
          200: { description: "Updated folder", content: { "application/json": { schema: { $ref: "#/components/schemas/Folder" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          422: { $ref: "#/components/responses/ValidationFailed" }
        }
      },
      delete: {
        tags: ["Folders"],
        summary: "Delete a folder",
        responses: {
          204: { description: "Deleted" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      }
    },
    "/api/contacts": {
      get: {
        tags: ["Contacts"],
        summary: "List contacts",
        parameters: [
          { name: "folder_id", in: "query", required: false, schema: { type: "string", format: "uuid" }, description: "Filter by folder" }
        ],
        responses: {
          200: { description: "Array of contacts", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Contact" } } } } },
          401: { $ref: "#/components/responses/Unauthorized" }
        }
      },
      post: {
        tags: ["Contacts"],
        summary: "Create a contact",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ContactInput" } } } },
        responses: {
          201: { description: "Created contact", content: { "application/json": { schema: { $ref: "#/components/schemas/Contact" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          422: { $ref: "#/components/responses/ValidationFailed" }
        }
      }
    },
    "/api/contacts/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdPath" }],
      get: {
        tags: ["Contacts"],
        summary: "Get a contact",
        responses: {
          200: { description: "Contact", content: { "application/json": { schema: { $ref: "#/components/schemas/Contact" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      },
      patch: {
        tags: ["Contacts"],
        summary: "Update a contact",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ContactInput" } } } },
        responses: {
          200: { description: "Updated contact", content: { "application/json": { schema: { $ref: "#/components/schemas/Contact" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          422: { $ref: "#/components/responses/ValidationFailed" }
        }
      },
      delete: {
        tags: ["Contacts"],
        summary: "Delete a contact",
        responses: {
          204: { description: "Deleted" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      }
    },
    "/api/debts": {
      get: {
        tags: ["Debts"],
        summary: "List debts",
        parameters: [
          { name: "status", in: "query", required: false, schema: { type: "string", enum: ["pending", "partial", "paid"] } },
          { name: "contact_id", in: "query", required: false, schema: { type: "string", format: "uuid" } },
          { name: "direction", in: "query", required: false, schema: { type: "string", enum: ["they_owe_me", "i_owe_them"] } }
        ],
        responses: {
          200: { description: "Array of debts", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Debt" } } } } },
          401: { $ref: "#/components/responses/Unauthorized" }
        }
      },
      post: {
        tags: ["Debts"],
        summary: "Create a debt",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateDebtInput" } } } },
        responses: {
          201: { description: "Created debt", content: { "application/json": { schema: { $ref: "#/components/schemas/Debt" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          422: { $ref: "#/components/responses/ValidationFailed" }
        }
      }
    },
    "/api/debts/{id}": {
      parameters: [{ $ref: "#/components/parameters/IdPath" }],
      get: {
        tags: ["Debts"],
        summary: "Get a debt",
        responses: {
          200: { description: "Debt", content: { "application/json": { schema: { $ref: "#/components/schemas/Debt" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      },
      patch: {
        tags: ["Debts"],
        summary: "Update a debt",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateDebtInput" } } } },
        responses: {
          200: { description: "Updated debt", content: { "application/json": { schema: { $ref: "#/components/schemas/Debt" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          422: { $ref: "#/components/responses/ValidationFailed" }
        }
      },
      delete: {
        tags: ["Debts"],
        summary: "Delete a debt",
        responses: {
          204: { description: "Deleted" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      }
    },
    "/api/debts/{id}/payments": {
      parameters: [{ $ref: "#/components/parameters/IdPath" }],
      get: {
        tags: ["Debts"],
        summary: "List payments for a debt",
        responses: {
          200: { description: "Array of payments", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Payment" } } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" }
        }
      },
      post: {
        tags: ["Debts"],
        summary: "Add a payment to a debt",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreatePaymentInput" } } } },
        responses: {
          201: { description: "Created payment", content: { "application/json": { schema: { $ref: "#/components/schemas/Payment" } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          422: { $ref: "#/components/responses/ValidationFailed" }
        }
      }
    },
    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Aggregated dashboard summary",
        responses: {
          200: { description: "Summary", content: { "application/json": { schema: { $ref: "#/components/schemas/DashboardSummary" } } } },
          401: { $ref: "#/components/responses/Unauthorized" }
        }
      }
    }
  }
};

// src/utils/AppError.ts
var AppError = class _AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, _AppError.prototype);
  }
};

// src/middleware/error.ts
function notFound(_req, res) {
  res.status(404).json({ error: "Route not found" });
}
function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  const pgErr = err;
  if (pgErr.code === "23505") {
    res.status(409).json({ error: "Resource already exists" });
    return;
  }
  console.error(err);
  res.status(500).json({
    error: "Internal server error",
    ...env.NODE_ENV !== "production" ? { detail: String(err) } : {}
  });
}

// src/modules/auth/auth.routes.ts
var import_express = require("express");

// src/utils/asyncHandler.ts
var asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// src/modules/auth/auth.service.ts
var import_crypto = require("crypto");

// src/config/db.ts
var import_pg = require("pg");
import_pg.types.setTypeParser(1700, (val) => parseFloat(val));
var useSsl = env.PGSSL || env.DATABASE_URL.includes("sslmode=require") || env.DATABASE_URL.includes("neon.tech") || env.DATABASE_URL.includes("supabase.co");
var pool = new import_pg.Pool({
  connectionString: env.DATABASE_URL || void 0,
  ssl: useSsl ? { rejectUnauthorized: false } : void 0
});
async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows;
}
async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}

// src/utils/password.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var SALT_ROUNDS = 10;
function hashPassword(plain) {
  return import_bcryptjs.default.hash(plain, SALT_ROUNDS);
}
function comparePassword(plain, hash) {
  return import_bcryptjs.default.compare(plain, hash);
}

// src/utils/jwt.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
function signAccessToken(payload) {
  const options = { expiresIn: env.ACCESS_TOKEN_TTL };
  return import_jsonwebtoken.default.sign(payload, env.ACCESS_TOKEN_SECRET, options);
}
function signRefreshToken(payload) {
  const options = { expiresIn: env.REFRESH_TOKEN_TTL };
  return import_jsonwebtoken.default.sign(payload, env.REFRESH_TOKEN_SECRET, options);
}
function verifyAccessToken(token) {
  return import_jsonwebtoken.default.verify(token, env.ACCESS_TOKEN_SECRET);
}
function verifyRefreshToken(token) {
  return import_jsonwebtoken.default.verify(token, env.REFRESH_TOKEN_SECRET);
}

// src/modules/auth/auth.service.ts
function toPublic(u) {
  return { id: u.id, name: u.name, email: u.email, created_at: u.created_at };
}
function ttlToMs(ttl) {
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) return 7 * 24 * 60 * 60 * 1e3;
  const n = parseInt(match[1], 10);
  const unit = match[2];
  const mult = unit === "s" ? 1e3 : unit === "m" ? 6e4 : unit === "h" ? 36e5 : 864e5;
  return n * mult;
}
async function issueTokens(user) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const jti = (0, import_crypto.randomUUID)();
  const refreshToken = signRefreshToken({ sub: user.id, jti });
  const expiresAt = new Date(Date.now() + ttlToMs(env.REFRESH_TOKEN_TTL));
  await query(
    `INSERT INTO refresh_tokens (id, user_id, expires_at) VALUES ($1, $2, $3)`,
    [jti, user.id, expiresAt]
  );
  return { accessToken, refreshToken };
}
async function register(input) {
  const existing = await queryOne(`SELECT * FROM users WHERE email = $1`, [input.email]);
  if (existing) throw new AppError("Email already registered", 409);
  const passwordHash = await hashPassword(input.password);
  const user = await queryOne(
    `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *`,
    [input.name, input.email, passwordHash]
  );
  if (!user) throw new AppError("Failed to create user", 500);
  const tokens = await issueTokens(user);
  return { user: toPublic(user), ...tokens };
}
async function login(input) {
  const user = await queryOne(`SELECT * FROM users WHERE email = $1`, [input.email]);
  if (!user) throw new AppError("Invalid email or password", 401);
  const ok = await comparePassword(input.password, user.password_hash);
  if (!ok) throw new AppError("Invalid email or password", 401);
  const tokens = await issueTokens(user);
  return { user: toPublic(user), ...tokens };
}
async function refresh(token) {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }
  const stored = await queryOne(`SELECT id, user_id, revoked, expires_at FROM refresh_tokens WHERE id = $1`, [payload.jti]);
  if (!stored || stored.revoked) throw new AppError("Refresh token revoked", 401);
  if (new Date(stored.expires_at) < /* @__PURE__ */ new Date()) throw new AppError("Refresh token expired", 401);
  await query(`UPDATE refresh_tokens SET revoked = true WHERE id = $1`, [payload.jti]);
  const user = await queryOne(`SELECT * FROM users WHERE id = $1`, [payload.sub]);
  if (!user) throw new AppError("User not found", 401);
  return issueTokens(user);
}
async function logout(token) {
  try {
    const payload = verifyRefreshToken(token);
    await query(`UPDATE refresh_tokens SET revoked = true WHERE id = $1`, [payload.jti]);
  } catch {
  }
}

// src/modules/auth/auth.controller.ts
var register2 = asyncHandler(async (req, res) => {
  const result = await register(req.body);
  res.status(201).json(result);
});
var login2 = asyncHandler(async (req, res) => {
  const result = await login(req.body);
  res.json(result);
});
var refresh2 = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await refresh(refreshToken);
  res.json(tokens);
});
var logout2 = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await logout(refreshToken);
  res.json({ message: "Logged out" });
});

// src/middleware/validate.ts
var validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ");
    throw new AppError(message || "Validation failed", 422);
  }
  req.body = result.data;
  next();
};

// src/modules/auth/auth.schema.ts
var import_zod = require("zod");
var registerSchema = import_zod.z.object({
  name: import_zod.z.string().min(1).max(120),
  email: import_zod.z.string().email(),
  password: import_zod.z.string().min(6).max(128)
});
var loginSchema = import_zod.z.object({
  email: import_zod.z.string().email(),
  password: import_zod.z.string().min(1)
});
var refreshSchema = import_zod.z.object({
  refreshToken: import_zod.z.string().min(10)
});

// src/modules/auth/auth.routes.ts
var router = (0, import_express.Router)();
router.post("/register", validateBody(registerSchema), register2);
router.post("/login", validateBody(loginSchema), login2);
router.post("/refresh", validateBody(refreshSchema), refresh2);
router.post("/logout", validateBody(refreshSchema), logout2);
var auth_routes_default = router;

// src/modules/users/users.routes.ts
var import_express2 = require("express");
var import_zod2 = require("zod");

// src/modules/users/users.service.ts
async function getById(id) {
  const user = await queryOne(
    `SELECT id, name, email, created_at FROM users WHERE id = $1`,
    [id]
  );
  if (!user) throw new AppError("User not found", 404);
  return user;
}
async function updateProfile(id, data) {
  const user = await queryOne(
    `UPDATE users SET name = COALESCE($2, name), updated_at = now()
     WHERE id = $1 RETURNING id, name, email, created_at`,
    [id, data.name ?? null]
  );
  if (!user) throw new AppError("User not found", 404);
  return user;
}

// src/modules/users/users.controller.ts
var me = asyncHandler(async (req, res) => {
  const user = await getById(req.user.id);
  res.json(user);
});
var updateMe = asyncHandler(async (req, res) => {
  const user = await updateProfile(req.user.id, req.body);
  res.json(user);
});

// src/middleware/auth.ts
function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Missing or invalid Authorization header", 401);
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }
}

// src/modules/users/users.routes.ts
var updateSchema = import_zod2.z.object({ name: import_zod2.z.string().min(1).max(120) });
var router2 = (0, import_express2.Router)();
router2.use(authenticate);
router2.get("/me", me);
router2.patch("/me", validateBody(updateSchema), updateMe);
var users_routes_default = router2;

// src/modules/folders/folders.routes.ts
var import_express3 = require("express");

// src/modules/folders/folders.service.ts
async function list(userId) {
  return query(
    `SELECT * FROM folders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
}
async function getOne(userId, id) {
  const folder = await queryOne(
    `SELECT * FROM folders WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  if (!folder) throw new AppError("Folder not found", 404);
  return folder;
}
async function create(userId, input) {
  const folder = await queryOne(
    `INSERT INTO folders (user_id, name, color) VALUES ($1, $2, $3) RETURNING *`,
    [userId, input.name, input.color ?? null]
  );
  return folder;
}
async function update(userId, id, input) {
  await getOne(userId, id);
  const folder = await queryOne(
    `UPDATE folders SET
       name = COALESCE($3, name),
       color = COALESCE($4, color),
       updated_at = now()
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId, input.name ?? null, input.color ?? null]
  );
  return folder;
}
async function remove(userId, id) {
  const rows = await query(
    `DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  if (rows.length === 0) throw new AppError("Folder not found", 404);
}

// src/modules/folders/folders.controller.ts
var list2 = asyncHandler(async (req, res) => {
  res.json(await list(req.user.id));
});
var getOne2 = asyncHandler(async (req, res) => {
  res.json(await getOne(req.user.id, req.params.id));
});
var create2 = asyncHandler(async (req, res) => {
  res.status(201).json(await create(req.user.id, req.body));
});
var update2 = asyncHandler(async (req, res) => {
  res.json(await update(req.user.id, req.params.id, req.body));
});
var remove2 = asyncHandler(async (req, res) => {
  await remove(req.user.id, req.params.id);
  res.status(204).send();
});

// src/modules/folders/folders.schema.ts
var import_zod3 = require("zod");
var createFolderSchema = import_zod3.z.object({
  name: import_zod3.z.string().min(1).max(120),
  color: import_zod3.z.string().max(20).optional()
});
var updateFolderSchema = createFolderSchema.partial();

// src/modules/folders/folders.routes.ts
var router3 = (0, import_express3.Router)();
router3.use(authenticate);
router3.get("/", list2);
router3.post("/", validateBody(createFolderSchema), create2);
router3.get("/:id", getOne2);
router3.patch("/:id", validateBody(updateFolderSchema), update2);
router3.delete("/:id", remove2);
var folders_routes_default = router3;

// src/modules/contacts/contacts.routes.ts
var import_express4 = require("express");

// src/modules/contacts/contacts.service.ts
async function assertFolderOwned(userId, folderId) {
  const folder = await queryOne(
    `SELECT id FROM folders WHERE id = $1 AND user_id = $2`,
    [folderId, userId]
  );
  if (!folder) throw new AppError("Folder not found", 404);
}
async function list3(userId, folderId) {
  if (folderId) {
    return query(
      `SELECT * FROM contacts WHERE user_id = $1 AND folder_id = $2 ORDER BY name ASC`,
      [userId, folderId]
    );
  }
  return query(`SELECT * FROM contacts WHERE user_id = $1 ORDER BY name ASC`, [userId]);
}
async function getOne3(userId, id) {
  const contact = await queryOne(
    `SELECT * FROM contacts WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  if (!contact) throw new AppError("Contact not found", 404);
  return contact;
}
async function create3(userId, input) {
  if (input.folder_id) await assertFolderOwned(userId, input.folder_id);
  const contact = await queryOne(
    `INSERT INTO contacts (user_id, folder_id, name, phone, email, note)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      userId,
      input.folder_id ?? null,
      input.name,
      input.phone ?? null,
      input.email ?? null,
      input.note ?? null
    ]
  );
  return contact;
}
async function update3(userId, id, input) {
  await getOne3(userId, id);
  if (input.folder_id) await assertFolderOwned(userId, input.folder_id);
  const contact = await queryOne(
    `UPDATE contacts SET
       folder_id = COALESCE($3, folder_id),
       name = COALESCE($4, name),
       phone = COALESCE($5, phone),
       email = COALESCE($6, email),
       note = COALESCE($7, note),
       updated_at = now()
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [
      id,
      userId,
      input.folder_id ?? null,
      input.name ?? null,
      input.phone ?? null,
      input.email ?? null,
      input.note ?? null
    ]
  );
  return contact;
}
async function remove3(userId, id) {
  const rows = await query(
    `DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  if (rows.length === 0) throw new AppError("Contact not found", 404);
}

// src/modules/contacts/contacts.controller.ts
var list4 = asyncHandler(async (req, res) => {
  const folderId = typeof req.query.folder_id === "string" ? req.query.folder_id : void 0;
  res.json(await list3(req.user.id, folderId));
});
var getOne4 = asyncHandler(async (req, res) => {
  res.json(await getOne3(req.user.id, req.params.id));
});
var create4 = asyncHandler(async (req, res) => {
  res.status(201).json(await create3(req.user.id, req.body));
});
var update4 = asyncHandler(async (req, res) => {
  res.json(await update3(req.user.id, req.params.id, req.body));
});
var remove4 = asyncHandler(async (req, res) => {
  await remove3(req.user.id, req.params.id);
  res.status(204).send();
});

// src/modules/contacts/contacts.schema.ts
var import_zod4 = require("zod");
var createContactSchema = import_zod4.z.object({
  name: import_zod4.z.string().min(1).max(120),
  phone: import_zod4.z.string().max(40).optional(),
  email: import_zod4.z.string().email().optional(),
  note: import_zod4.z.string().max(1e3).optional(),
  folder_id: import_zod4.z.string().uuid().optional()
});
var updateContactSchema = createContactSchema.partial();

// src/modules/contacts/contacts.routes.ts
var router4 = (0, import_express4.Router)();
router4.use(authenticate);
router4.get("/", list4);
router4.post("/", validateBody(createContactSchema), create4);
router4.get("/:id", getOne4);
router4.patch("/:id", validateBody(updateContactSchema), update4);
router4.delete("/:id", remove4);
var contacts_routes_default = router4;

// src/modules/debts/debts.routes.ts
var import_express5 = require("express");

// src/modules/debts/debts.service.ts
async function assertContactOwned(userId, contactId) {
  const contact = await queryOne(
    `SELECT id FROM contacts WHERE id = $1 AND user_id = $2`,
    [contactId, userId]
  );
  if (!contact) throw new AppError("Contact not found", 404);
}
async function list5(userId, filters) {
  const conditions = ["user_id = $1"];
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
  return query(
    `SELECT * FROM debts WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
    params
  );
}
async function getOne5(userId, id) {
  const debt = await queryOne(
    `SELECT * FROM debts WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  if (!debt) throw new AppError("Debt not found", 404);
  return debt;
}
async function create5(userId, input) {
  await assertContactOwned(userId, input.contact_id);
  const debt = await queryOne(
    `INSERT INTO debts (user_id, contact_id, direction, amount, currency, description, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      userId,
      input.contact_id,
      input.direction,
      input.amount,
      input.currency,
      input.description ?? null,
      input.due_date ?? null
    ]
  );
  return debt;
}
async function update5(userId, id, input) {
  await getOne5(userId, id);
  if (input.contact_id) await assertContactOwned(userId, input.contact_id);
  const debt = await queryOne(
    `UPDATE debts SET
       contact_id  = COALESCE($3, contact_id),
       direction   = COALESCE($4, direction),
       amount      = COALESCE($5, amount),
       currency    = COALESCE($6, currency),
       description = COALESCE($7, description),
       due_date    = COALESCE($8, due_date),
       status      = COALESCE($9, status),
       updated_at  = now()
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [
      id,
      userId,
      input.contact_id ?? null,
      input.direction ?? null,
      input.amount ?? null,
      input.currency ?? null,
      input.description ?? null,
      input.due_date ?? null,
      input.status ?? null
    ]
  );
  return debt;
}
async function remove5(userId, id) {
  const rows = await query(
    `DELETE FROM debts WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  if (rows.length === 0) throw new AppError("Debt not found", 404);
}
async function listPayments(userId, debtId) {
  await getOne5(userId, debtId);
  return query(
    `SELECT * FROM payments WHERE debt_id = $1 AND user_id = $2 ORDER BY paid_at DESC`,
    [debtId, userId]
  );
}
async function addPayment(userId, debtId, input) {
  const debt = await getOne5(userId, debtId);
  const payment = await queryOne(
    `INSERT INTO payments (debt_id, user_id, amount, note, paid_at)
     VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, now())) RETURNING *`,
    [debtId, userId, input.amount, input.note ?? null, input.paid_at ?? null]
  );
  const paidRow = await queryOne(
    `SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE debt_id = $1`,
    [debtId]
  );
  const totalPaid = paidRow?.total_paid ?? 0;
  let status = "pending";
  if (totalPaid >= debt.amount) status = "paid";
  else if (totalPaid > 0) status = "partial";
  const updated = await queryOne(
    `UPDATE debts SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
    [debtId, status]
  );
  return { payment, debt: updated };
}

// src/modules/debts/debts.controller.ts
function strOrUndef(v) {
  return typeof v === "string" ? v : void 0;
}
var list6 = asyncHandler(async (req, res) => {
  res.json(
    await list5(req.user.id, {
      status: strOrUndef(req.query.status),
      contact_id: strOrUndef(req.query.contact_id),
      direction: strOrUndef(req.query.direction)
    })
  );
});
var getOne6 = asyncHandler(async (req, res) => {
  res.json(await getOne5(req.user.id, req.params.id));
});
var create6 = asyncHandler(async (req, res) => {
  res.status(201).json(await create5(req.user.id, req.body));
});
var update6 = asyncHandler(async (req, res) => {
  res.json(await update5(req.user.id, req.params.id, req.body));
});
var remove6 = asyncHandler(async (req, res) => {
  await remove5(req.user.id, req.params.id);
  res.status(204).send();
});
var listPayments2 = asyncHandler(async (req, res) => {
  res.json(await listPayments(req.user.id, req.params.id));
});
var addPayment2 = asyncHandler(async (req, res) => {
  res.status(201).json(await addPayment(req.user.id, req.params.id, req.body));
});

// src/modules/debts/debts.schema.ts
var import_zod5 = require("zod");
var isoDate = import_zod5.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD");
var createDebtSchema = import_zod5.z.object({
  contact_id: import_zod5.z.string().uuid(),
  direction: import_zod5.z.enum(["they_owe_me", "i_owe_them"]),
  amount: import_zod5.z.number().positive().max(1e9),
  currency: import_zod5.z.string().min(1).max(8).default("USD"),
  description: import_zod5.z.string().max(1e3).optional(),
  due_date: isoDate.optional()
});
var updateDebtSchema = import_zod5.z.object({
  contact_id: import_zod5.z.string().uuid().optional(),
  direction: import_zod5.z.enum(["they_owe_me", "i_owe_them"]).optional(),
  amount: import_zod5.z.number().positive().max(1e9).optional(),
  currency: import_zod5.z.string().min(1).max(8).optional(),
  description: import_zod5.z.string().max(1e3).optional(),
  due_date: isoDate.optional(),
  status: import_zod5.z.enum(["pending", "partial", "paid"]).optional()
});
var createPaymentSchema = import_zod5.z.object({
  amount: import_zod5.z.number().positive().max(1e9),
  note: import_zod5.z.string().max(500).optional(),
  paid_at: import_zod5.z.string().optional()
});

// src/modules/debts/debts.routes.ts
var router5 = (0, import_express5.Router)();
router5.use(authenticate);
router5.get("/", list6);
router5.post("/", validateBody(createDebtSchema), create6);
router5.get("/:id", getOne6);
router5.patch("/:id", validateBody(updateDebtSchema), update6);
router5.delete("/:id", remove6);
router5.get("/:id/payments", listPayments2);
router5.post("/:id/payments", validateBody(createPaymentSchema), addPayment2);
var debts_routes_default = router5;

// src/modules/dashboard/dashboard.routes.ts
var import_express6 = require("express");

// src/modules/dashboard/dashboard.service.ts
async function summary(userId) {
  const totals = await query(
    `SELECT direction, COALESCE(SUM(amount), 0) AS total
     FROM debts WHERE user_id = $1 GROUP BY direction`,
    [userId]
  );
  const outstanding = await query(
    `SELECT d.direction,
            COALESCE(SUM(d.amount - COALESCE(p.paid, 0)), 0) AS outstanding
     FROM debts d
     LEFT JOIN (
       SELECT debt_id, SUM(amount) AS paid FROM payments GROUP BY debt_id
     ) p ON p.debt_id = d.id
     WHERE d.user_id = $1 AND d.status <> 'paid'
     GROUP BY d.direction`,
    [userId]
  );
  const statusRows = await query(
    `SELECT status, COUNT(*) AS c FROM debts WHERE user_id = $1 GROUP BY status`,
    [userId]
  );
  const contactsRow = await queryOne(
    `SELECT COUNT(*) AS c FROM contacts WHERE user_id = $1`,
    [userId]
  );
  const upcoming = await query(
    `SELECT d.id, d.amount, d.currency, d.direction, d.due_date, d.status,
            c.name AS contact_name
     FROM debts d
     JOIN contacts c ON c.id = d.contact_id
     WHERE d.user_id = $1
       AND d.status <> 'paid'
       AND d.due_date IS NOT NULL
       AND d.due_date <= (CURRENT_DATE + INTERVAL '30 days')
     ORDER BY d.due_date ASC
     LIMIT 10`,
    [userId]
  );
  const totalTheyOwe = totals.find((t) => t.direction === "they_owe_me")?.total ?? 0;
  const totalIOwe = totals.find((t) => t.direction === "i_owe_them")?.total ?? 0;
  const outTheyOwe = outstanding.find((t) => t.direction === "they_owe_me")?.outstanding ?? 0;
  const outIOwe = outstanding.find((t) => t.direction === "i_owe_them")?.outstanding ?? 0;
  const counts = { pending: 0, partial: 0, paid: 0, total: 0 };
  for (const row of statusRows) {
    const n = Number(row.c);
    if (row.status === "pending") counts.pending = n;
    else if (row.status === "partial") counts.partial = n;
    else if (row.status === "paid") counts.paid = n;
    counts.total += n;
  }
  return {
    totals: {
      they_owe_me: totalTheyOwe,
      i_owe_them: totalIOwe
    },
    outstanding: {
      they_owe_me: outTheyOwe,
      i_owe_them: outIOwe,
      net_balance: outTheyOwe - outIOwe
      // positive => net owed to you
    },
    counts,
    contacts_count: Number(contactsRow?.c ?? 0),
    upcoming_due: upcoming
  };
}

// src/modules/dashboard/dashboard.controller.ts
var summary2 = asyncHandler(async (req, res) => {
  res.json(await summary(req.user.id));
});

// src/modules/dashboard/dashboard.routes.ts
var router6 = (0, import_express6.Router)();
router6.use(authenticate);
router6.get("/summary", summary2);
var dashboard_routes_default = router6;

// src/app.ts
function createApp() {
  const app2 = (0, import_express7.default)();
  app2.use((req, _res, next) => {
    const matchedPath = req.headers["x-matched-path"];
    if (matchedPath && req.url !== matchedPath) {
      req.url = matchedPath;
    }
    next();
  });
  const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Debt Tracker API Docs</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .topbar { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/docs.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        docExpansion: "list"
      });
    };
  </script>
</body>
</html>`;
  app2.get("/docs.json", (_req, res) => res.json(openapiSpec));
  app2.get(["/", "/docs", "/docs/"], (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(swaggerHtml);
  });
  app2.use((0, import_helmet.default)({ contentSecurityPolicy: false }));
  app2.use(
    (0, import_cors.default)({ origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",") })
  );
  app2.use(import_express7.default.json());
  if (env.NODE_ENV !== "test") app2.use((0, import_morgan.default)("dev"));
  app2.get("/health", (_req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.use("/api/auth", auth_routes_default);
  app2.use("/api/users", users_routes_default);
  app2.use("/api/folders", folders_routes_default);
  app2.use("/api/contacts", contacts_routes_default);
  app2.use("/api/debts", debts_routes_default);
  app2.use("/api/dashboard", dashboard_routes_default);
  app2.use(notFound);
  app2.use(errorHandler);
  return app2;
}

// src/vercel-handler.ts
var app = createApp();
module.exports = app;
module.exports.default = app;
