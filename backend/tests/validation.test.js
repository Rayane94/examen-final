const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validOrder, isInteger, objectId, statuses, email } = require('../utils/validation');
const id = '507f1f77bcf86cd799439011';
const body = () => ({ items: [{ productId: id, quantity: 2, price: 0.01 }], shippingAddress: { street:'1 avenue',city:'Paris',postalCode:'75001',country:'France' }, paymentMethod:'PayPal',shippingMethod:'colissimo' });
test('quantité entier strict positif', () => { assert.equal(isInteger(1,1),true); assert.equal(isInteger(-1,1),false); assert.equal(isInteger('3',1),false); });
test('identifiants Mongo vérifiés', () => { assert.equal(objectId(id),true); assert.equal(objectId('xxx'),false); });
test('commande valide (prix client ignoré par le backend)', () => { assert.equal(validOrder(body()),true); });
test('rejet commande invalide', () => { const b=body();b.items[0].quantity=-2;assert.equal(validOrder(b),false); });
test('rejet mode paiement invalide', () => { const b=body();b.paymentMethod='gratuit';assert.equal(validOrder(b),false); });
test('validation email / statut', () => { assert.equal(email('test@example.org'),true);assert.equal(email('bad'),false);assert.ok(statuses.includes('Expédiée')); });

test('rejet tentative de balise HTML dans une adresse de livraison', () => {
  const b = body();
  b.shippingAddress.street = '<img src=x onerror=alert(1)>';
  assert.equal(validOrder(b), false);
});
test('rejet caractères HTML dans un champ utilisateur', () => {
  const { text } = require('../utils/validation');
  assert.equal(text('<script>alert(1)</script>', 3, 30), false);
  assert.equal(text('Paris 17', 3, 30), true);
});
