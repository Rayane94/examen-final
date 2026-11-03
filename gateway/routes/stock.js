const router = require('express').Router();
const proxy = require('express-http-proxy');
const upstream = process.env.STOCK_SERVICE_URL || 'http://localhost:4003';
router.use('/', proxy(upstream, { proxyReqPathResolver: req => req.originalUrl }));
module.exports = router;
