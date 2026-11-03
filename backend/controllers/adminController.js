const order = require('./orderController');
const product = require('./productController');
exports.getOrders = order.getOrders;
exports.updateOrderStatus = order.updateOrderStatus;
exports.validateOrder = order.validateOrder;
exports.getProducts = product.getProducts;
exports.updateProductStock = product.updateProductStock;
