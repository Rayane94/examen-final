const objectId = (v) => typeof v === 'string' && /^[a-f0-9]{24}$/i.test(v);
const isInteger = (v, min = 0, max = 100000) => Number.isSafeInteger(v) && v >= min && v <= max;
const text = (v, min = 1, max = 120) => typeof v === 'string' && v.trim().length >= min && v.trim().length <= max;
const email = (v) => typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const statuses = ['En attente', 'En cours de traitement', 'Expédiée', 'Délivrée', 'Annulée'];
const payments = ['Carte bancaire', 'PayPal', 'Virement'];
const shippings = ['colissimo', 'chronopost'];
const validOrder = (body) => body && Array.isArray(body.items) && body.items.length > 0 && body.items.length <= 50 &&
  body.items.every(i => i && objectId(i.productId) && isInteger(i.quantity, 1, 100)) &&
  body.shippingAddress && ['street','city','postalCode','country'].every(k => text(body.shippingAddress[k], 2, 120)) &&
  payments.includes(body.paymentMethod) && shippings.includes(body.shippingMethod);
module.exports = { objectId, isInteger, text, email, statuses, payments, shippings, validOrder };
