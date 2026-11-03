const router = require('express').Router();
const proxy = require('express-http-proxy');
const upstream = process.env.NOTIFI_SERVICE_URL || 'http://localhost:4002';
router.use('/', proxy(upstream, { proxyReqPathResolver: req => req.originalUrl }));
module.exports = router;
