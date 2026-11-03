function log(level, event, details = {}) {
  // Do not pass passwords, bearer tokens, cookies or connection strings to details.
  const safe = Object.fromEntries(Object.entries(details).filter(([k]) => !/password|secret|token|cookie|uri|authorization/i.test(k)));
  process.stdout.write(JSON.stringify({ time: new Date().toISOString(), level, event, ...safe }) + '\n');
}
module.exports = { info: (event, details) => log('info', event, details), warn: (event, details) => log('warn', event, details), error: (event, details) => log('error', event, details) };
