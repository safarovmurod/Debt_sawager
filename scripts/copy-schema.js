// Copies schema.sql into dist/db after the TypeScript build,
// so `npm run migrate:prod` can read it in production.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'db', 'schema.sql');
const destDir = path.join(__dirname, '..', 'dist', 'db');

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, path.join(destDir, 'schema.sql'));
console.log('Copied schema.sql -> dist/db/schema.sql');

try {
  const { openapiSpec } = require('../dist/docs/openapi.js');
  const publicDir = path.join(__dirname, '..', 'public');
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'docs.json'), JSON.stringify(openapiSpec, null, 2));
  console.log('Generated public/docs.json');
} catch (e) {
  console.warn('Could not generate public/docs.json:', e.message);
}

