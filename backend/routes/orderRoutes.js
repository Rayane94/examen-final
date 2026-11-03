const router = require('express').Router();
const order = require('../controllers/orderController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
router.get('/', authenticateToken, isAdmin, order.getOrders);
router.post('/', authenticateToken, order.createOrder);
router.delete('/:id', authenticateToken, isAdmin, order.deleteOrder);
router.put('/:id/validate', authenticateToken, isAdmin, order.validateOrder);
router.put('/:orderId/status', authenticateToken, isAdmin, order.updateOrderStatus);
module.exports = router;
