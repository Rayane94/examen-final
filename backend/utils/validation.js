/** Vérifie le format d'un ObjectId MongoDB avant toute requête.
 * @param {unknown} v - Identifiant reçu de l'API.
 * @returns {boolean}
 */
const objectId = (v) => typeof v === 'string' && /^[a-f0-9]{24}$/i.test(v);
/** Vérifie un nombre entier dans un intervalle autorisé.
 * @param {unknown} v - Valeur non fiable.
 * @param {number} [min=0] - Minimum inclus.
 * @param {number} [max=100000] - Maximum inclus.
 * @returns {boolean}
 */
const isInteger = (v, min = 0, max = 100000) => Number.isSafeInteger(v) && v >= min && v <= max;
/** Valide une chaîne utilisateur et refuse les chevrons de balises HTML.
 * Les autres couches (encodage React, contrôle d'accès, CSP) restent nécessaires.
 * @param {unknown} v - Texte saisi.
 * @param {number} [min=1] - Taille minimale.
 * @param {number} [max=120] - Taille maximale.
 * @returns {boolean}
 */
const text = (v, min = 1, max = 120) => typeof v === 'string' &&
  v.trim().length >= min && v.trim().length <= max && !/[<>]/.test(v);
const email = (v) => typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const statuses = ['En attente', 'En cours de traitement', 'Expédiée', 'Délivrée', 'Annulée'];
const payments = ['Carte bancaire', 'PayPal', 'Virement'];
const shippings = ['colissimo', 'chronopost'];
/** Contrôle les champs d'une commande avant lecture en base.
 * Le prix envoyé par le navigateur n'est jamais considéré comme source de vérité.
 * @param {unknown} body - Données JSON de la commande.
 * @returns {boolean} Vrai lorsque la structure de la commande est correcte.
 */
const validOrder = (body) => body && Array.isArray(body.items) && body.items.length > 0 && body.items.length <= 50 &&
  body.items.every(i => i && objectId(i.productId) && isInteger(i.quantity, 1, 100)) &&
  body.shippingAddress && ['street','city','postalCode','country'].every(k => text(body.shippingAddress[k], 2, 120)) &&
  payments.includes(body.paymentMethod) && shippings.includes(body.shippingMethod);
module.exports = { objectId, isInteger, text, email, statuses, payments, shippings, validOrder };
