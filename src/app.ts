import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { openapiSpec } from './docs/openapi';
import { notFound, errorHandler } from './middleware/error';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import foldersRoutes from './modules/folders/folders.routes';
import contactsRoutes from './modules/contacts/contacts.routes';
import debtsRoutes from './modules/debts/debts.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

export function createApp() {
  const app = express();

  // Support Vercel serverless rewritten path
  app.use((req, _res, next) => {
    const matchedPath = req.headers['x-matched-path'] as string;
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
  app.get('/docs.json', (_req, res) => res.json(openapiSpec));
  app.get(['/', '/docs', '/docs/'], (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(swaggerHtml);
  });

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',') })
  );
  app.use(express.json());
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/folders', foldersRoutes);
  app.use('/api/contacts', contactsRoutes);
  app.use('/api/debts', debtsRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
