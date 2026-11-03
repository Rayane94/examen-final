const Product = require('../models/Product');
const { isInteger, objectId } = require('../utils/validation');
const logger = require('../utils/logger');
exports.getProducts = async (req, res) => {
  try { res.json(await Product.find().sort({ name: 1 })); }
  catch (err) { logger.error('products_read_error'); res.status(500).json({ message: 'Erreur serveur' }); }
};
/** Modifie le stock d'un produit après vérification des bornes et du rôle.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
exports.updateProductStock = async (req, res) => {
  const productId = req.params.productId || req.params.id;
  const stock = req.body?.stock;
  if (!objectId(productId) || !isInteger(stock, 0, 1000000)) return res.status(400).json({ message: 'Identifiant ou stock invalide' });
  try {
    const product = await Product.findByIdAndUpdate(productId, { stock }, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    logger.info('product_stock_updated', { productId, stock });
    res.json({ message: 'Stock mis à jour', product });
  } catch (err) { logger.error('product_update_error'); res.status(500).json({ message: 'Erreur serveur' }); }
};
