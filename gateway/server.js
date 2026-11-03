const express = require('express');
const logger = require('pino')({ name: 'gateway' });
require('dotenv').config();
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'gateway' }));
app.use((req, res, next) => {
  if (!process.env.INTERNAL_SERVICE_TOKEN || req.get('x-service-token') !== process.env.INTERNAL_SERVICE_TOKEN)
    return res.status(403).json({ message: 'Accès interne refusé' });
  next();
});
app.use('/notify', require('./routes/notifi'));
app.use('/update-stock', require('./routes/stock'));
app.use((_, res) => res.status(404).json({ message: 'Route inconnue' }));
const PORT = Number(process.env.GATEWAY_PORT || 8000);
app.listen(PORT, '0.0.0.0', () => logger.info({ event: 'gateway_started', port: PORT }));
