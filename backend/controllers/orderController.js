const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { objectId, statuses, validOrder } = require('../utils/validation');
const logger = require('../utils/logger');
const gateway = process.env.GATEWAY_URL || 'http://localhost:8000';
const headers = () => ({ 'x-service-token': process.env.INTERNAL_SERVICE_TOKEN || '' });
const event = async (path, payload) => {
  try { await axios.post(`${gateway}${path}`, payload, { timeout: 1500, headers: headers() }); }
  catch { logger.warn('service_notification_failed', { path }); }
};
exports.createOrder = async (req, res) => {
  const body = req.body;
  if (!validOrder(body)) return res.status(400).json({ message: 'Commande, livraison ou paiement invalide' });
  const stockChanges = [];
  let saved = false;
  try {
    const requested = new Map();
    for (const line of body.items) requested.set(line.productId, (requested.get(line.productId) || 0) + line.quantity);
    if ([...requested.values()].some(q => q > 100)) return res.status(400).json({ message: 'Quantité maximale dépassée' });
    const products = await Product.find({ _id: { $in: [...requested.keys()] } });
    if (products.length !== requested.size) return res.status(400).json({ message: 'Produit inconnu' });
    const details = products.map(p => ({ productId: p._id, quantity: requested.get(String(p._id)), price: p.price }));
    const total = Math.round(details.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;
    if (!Number.isFinite(total)) return res.status(400).json({ message: 'Montant invalide' });
    // Atomic stock guard for each item; compensating rollback on failure.
    for (const item of details) {
      const updated = await Product.updateOne({ _id: item.productId, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
      if (!updated.modifiedCount) {
        for (const change of stockChanges) await Product.updateOne({ _id: change.productId }, { $inc: { stock: change.quantity } });
        return res.status(409).json({ message: 'Stock insuffisant' });
      }
      stockChanges.push(item);
    }
    const order = await Order.create({
      userId: req.user.userId, items: details, total,
      shippingAddress: Object.fromEntries(['street','city','postalCode','country'].map(k => [k, body.shippingAddress[k].trim()])),
      paymentMethod: body.paymentMethod, shippingMethod: body.shippingMethod,
    });
    saved = true;
    logger.info('order_created', { orderId: String(order._id), total });
    res.status(201).json({ message: 'Commande créée', order });
    // These events are best-effort; authoritative stock update is in backend MongoDB.
    event('/notify', { to: process.env.NOTIFICATION_EMAIL || '', subject: 'Nouvelle commande', text: `Commande ${order._id} créée` });
    event('/update-stock', { orderId: String(order._id), items: details.map(i => ({ productId: String(i.productId), quantity: i.quantity })) });
  } catch (err) {
    logger.error('order_creation_error');
    if (!saved) for (const change of stockChanges) {
      try { await Product.updateOne({ _id: change.productId }, { $inc: { stock: change.quantity } }); }
      catch { logger.error('stock_rollback_failed', { productId: String(change.productId) }); }
    }
    if (!res.headersSent) res.status(500).json({ message: 'Erreur lors de la commande' });
  }
};
exports.getOrders = async (req, res) => {
  try { res.json(await Order.find().sort({ createdAt: -1 }).limit(200)); }
  catch { res.status(500).json({ message: 'Erreur serveur' }); }
};
exports.deleteOrder = async (req, res) => {
  if (!objectId(req.params.id)) return res.status(400).json({ message: 'Identifiant invalide' });
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });
    if (!['En attente', 'Annulée'].includes(order.status)) return res.status(409).json({ message: 'Suppression interdite après traitement' });
    await Order.deleteOne({ _id: order._id });
    if (order.status !== 'Annulée') for (const item of order.items) await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
    res.json({ message: 'Commande supprimée' });
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
};
exports.updateOrderStatus = async (req, res) => {
  const id = req.params.id || req.params.orderId;
  const { status } = req.body || {};
  if (!objectId(id) || !statuses.includes(status)) return res.status(400).json({ message: 'Statut ou identifiant invalide' });
  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });
    logger.info('order_status_updated', { orderId: id, status });
    res.json({ message: 'Statut mis à jour', order });
    event('/notify', { to: process.env.NOTIFICATION_EMAIL || '', subject: 'Mise à jour de commande', text: `Commande ${id} : ${status}` });
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
};
exports.validateOrder = (req, res) => {
  req.body = { status: 'En cours de traitement' };
  return exports.updateOrderStatus(req, res);
};
