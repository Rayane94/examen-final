const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isAdmin } = require('../middlewares/authMiddleware');

function response() {
  return {
    code: 200,
    body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('un client standard est refusé par le middleware admin (403)', () => {
  const res = response();
  let called = false;
  isAdmin({ user: { role: 'user' } }, res, () => { called = true; });
  assert.equal(res.code, 403);
  assert.equal(called, false);
});

test('un administrateur est autorisé par le middleware', () => {
  const res = response();
  let called = false;
  isAdmin({ user: { role: 'admin' } }, res, () => { called = true; });
  assert.equal(res.code, 200);
  assert.equal(called, true);
});
