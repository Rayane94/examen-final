const express = require('express');
const logger = require('pino')({ name: 'stock-management' });
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit:'16kb' }));
app.get('/health', (_,res) => res.json({status:'ok',service:'stock-management'}));
app.post('/update-stock', (req,res) => {
  if (!Array.isArray(req.body?.items)) return res.status(400).json({ message:'Liste des modifications attendue' });
  // Event receiver for auditing only. Database stock is updated atomically by backend.
  logger.info({ event: 'stock_update_recorded', orderId: req.body.orderId, count: req.body.items.length });
  res.json({status:'recorded'});
});
app.listen(Number(process.env.STOCK_PORT || 4003),'0.0.0.0',()=>logger.info({ event: 'stock_service_started' }));
