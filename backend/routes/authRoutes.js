const router = require('express').Router();
const auth = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
router.post('/login', auth.login);
router.post('/register', auth.register);
router.post('/logout', auth.logout);
router.get('/me', authenticateToken, auth.me);
module.exports = router;
