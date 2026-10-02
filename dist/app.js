"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const openapi_1 = require("./docs/openapi");
const error_1 = require("./middleware/error");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const folders_routes_1 = __importDefault(require("./modules/folders/folders.routes"));
const contacts_routes_1 = __importDefault(require("./modules/contacts/contacts.routes"));
const debts_routes_1 = __importDefault(require("./modules/debts/debts.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
function createApp() {
    const app = (0, express_1.default)();
    // Support Vercel serverless rewritten path
    app.use((req, _res, next) => {
        const matchedPath = req.headers['x-matched-path'];
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
    // API docs
    app.get('/docs.json', (_req, res) => res.json(openapi_1.openapiSpec));
    app.get(['/', '/docs', '/docs/'], (_req, res) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(swaggerHtml);
    });
    app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
    app.use((0, cors_1.default)({ origin: env_1.env.CORS_ORIGIN === '*' ? true : env_1.env.CORS_ORIGIN.split(',') }));
    app.use(express_1.default.json());
    if (env_1.env.NODE_ENV !== 'test')
        app.use((0, morgan_1.default)('dev'));
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', time: new Date().toISOString() });
    });
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/users', users_routes_1.default);
    app.use('/api/folders', folders_routes_1.default);
    app.use('/api/contacts', contacts_routes_1.default);
    app.use('/api/debts', debts_routes_1.default);
    app.use('/api/dashboard', dashboard_routes_1.default);
    app.use(error_1.notFound);
    app.use(error_1.errorHandler);
    return app;
}
