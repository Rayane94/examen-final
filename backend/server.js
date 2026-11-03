const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : false, credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  const requestId = crypto.randomUUID();
  res.setHeader('X-Request-ID', requestId);
  const start = Date.now();
  res.on('finish', () => logger.info('http_request', { requestId, method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - start }));
  next();
});
app.use((req, res, next) => {
  // Same-site cookie endpoints: reject state-changing browser requests from another origin.
  if (!['GET','HEAD','OPTIONS'].includes(req.method) && req.get('origin')) {
    const base = process.env.PUBLIC_ORIGIN || req.protocol + '://' + req.get('host');
    if (req.get('origin') !== base && !((process.env.CORS_ORIGIN || '').split(',').includes(req.get('origin'))))
      return res.status(403).json({ message: 'Origine non autorisée' });
  }
  next();
});
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'backend' }));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
// Render : un unique port public pour l'API et le frontend React.
// Le mode Docker Compose local conserve son Nginx et n'utilise pas ce bloc.
if (process.env.SERVE_FRONTEND === 'true') {
  const path = require('node:path');
  const buildDirectory = path.join(__dirname, '..', 'frontend-build');
  app.use(express.static(buildDirectory, { index: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(buildDirectory, 'index.html'));
  });
}
app.use((req, res) => res.status(404).json({ message: 'Route inconnue' }));
app.use((err, req, res, next) => { logger.error('unhandled_request_error'); res.status(500).json({ message: 'Erreur serveur' }); });
const PORT = Number(process.env.PORT || 5000);
if (require.main === module) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) { logger.error('jwt_secret_missing_or_invalid'); process.exit(1); }
  connectDB().then(() => app.listen(PORT, '0.0.0.0', () => logger.info('backend_started', { port: PORT })))
    .catch(() => { logger.error('mongodb_connection_failed'); process.exit(1); });
}
module.exports = app;
