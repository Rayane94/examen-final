const jwt = require('jsonwebtoken');
const User = require('../models/User');
function getCookie(req, name) {
  const segment = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  return segment ? decodeURIComponent(segment.slice(name.length + 1)) : null;
}
exports.authenticateToken = async (req, res, next) => {
  const auth = req.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const token = getCookie(req, 'session') || bearer;
  if (!token) return res.status(401).json({ message: 'Connexion requise' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(decoded.userId).select('role username');
    if (!user) return res.status(401).json({ message: 'Session invalide' });
    req.user = { userId: String(user._id), role: user.role, username: user.username };
    req.authViaCookie = !bearer;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session invalide ou expirée' });
  }
};
exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Accès administrateur requis' });
  next();
};
