const pino = require('pino');

const base = pino({
  name: 'backend',
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  // Protection complémentaire : ne jamais passer les données sensibles au logger.
  redact: {
    paths: ['password', 'token', 'cookie', 'authorization', 'req.headers.cookie', 'req.headers.authorization'],
    censor: '[REDACTED]',
  },
});

/**
 * Émet un événement d'audit structuré, sans secrets d'authentification.
 * @param {'info'|'warn'|'error'} level - Niveau de gravité.
 * @param {string} event - Identifiant stable de l'événement.
 * @param {Record<string, unknown>} [details={}] - Métadonnées autorisées (sans contenu sensible).
 */
function log(level, event, details = {}) {
  const safe = Object.fromEntries(
    Object.entries(details).filter(([key]) => !/password|secret|token|cookie|uri|authorization/i.test(key))
  );
  base[level]({ event, ...safe }, event);
}

module.exports = {
  info: (event, details) => log('info', event, details),
  warn: (event, details) => log('warn', event, details),
  error: (event, details) => log('error', event, details),
};
