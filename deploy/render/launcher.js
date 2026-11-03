// Deployment Render économique : les microservices restent des processus
// indépendants, mais partagent ici un seul conteneur pour limiter les coûts.
'use strict';
const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const required = ['MONGO_URI', 'JWT_SECRET', 'INTERNAL_SERVICE_TOKEN'];
for (const key of required) {
  if (!process.env[key] || (key !== 'MONGO_URI' && process.env[key].length < 32)) {
    console.error(`Configuration manquante ou trop courte : ${key}`);
    process.exit(1);
  }
}
const hostname = process.env.RENDER_EXTERNAL_HOSTNAME;
const origin = process.env.PUBLIC_ORIGIN || (hostname ? `https://${hostname}` : '');
if (!origin) {
  console.error('PUBLIC_ORIGIN ou RENDER_EXTERNAL_HOSTNAME requis');
  process.exit(1);
}
const env = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: String(process.env.PORT || 10000),
  PUBLIC_ORIGIN: origin,
  SERVE_FRONTEND: 'true',
  COOKIE_SECURE: 'true',
  GATEWAY_URL: 'http://127.0.0.1:8000',
  GATEWAY_PORT: '8000',
  NOTIFI_SERVICE_URL: 'http://127.0.0.1:4002',
  NOTIFI_PORT: '4002',
  STOCK_SERVICE_URL: 'http://127.0.0.1:4003',
  STOCK_PORT: '4003',
  MAIL_MODE: process.env.MAIL_MODE || 'disabled',
};
// Peu importe le nombre de redémarrages Render : le seed est idempotent.
const seed = spawnSync(process.execPath, ['seeder.js'], {
  cwd: path.join(root, 'backend'), env, stdio: 'inherit', timeout: 60000,
});
if (seed.status !== 0 || seed.error) {
  console.error('Echec du seed MongoDB');
  process.exit(1);
}
const components = [
  ['notifications', 'microservices/notifications/index.js'],
  ['stock-management', 'microservices/stock-management/index.js'],
  ['gateway', 'gateway/server.js'],
  ['backend', 'backend/server.js'],
];
let stopping = false;
const children = [];
function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const { process: child } of children) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 4000).unref();
}
for (const [name, file] of components) {
  const child = spawn(process.execPath, [path.join(root, file)], {
    cwd: path.dirname(path.join(root, file)), env, stdio: 'inherit',
  });
  children.push({ name, process: child });
  child.once('error', err => {
    console.error(`${name} : ${err.message}`);
    shutdown(1);
  });
  child.once('exit', (code, signal) => {
    if (!stopping) {
      console.error(`${name} s'est arrêté (${code ?? signal})`);
      shutdown(1);
    }
  });
}
process.on('SIGTERM', () => shutdown(0));
process.on('SIGINT', () => shutdown(0));
