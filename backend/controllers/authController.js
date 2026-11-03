const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { text, email } = require('../utils/validation');
const logger = require('../utils/logger');
const secure = process.env.COOKIE_SECURE === 'true';
const setSessionCookie = (res, token, maxAge = 3600) => {
  res.setHeader('Set-Cookie', `session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`);
};
exports.login = async (req, res) => {
  const { username, password } = req.body || {};
  if (!text(username, 3, 30) || typeof password !== 'string' || !password) return res.status(400).json({ message: 'Identifiants manquants' });
  try {
    const user = await User.findOne({ username: username.trim() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn('login_failed');
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    const token = jwt.sign({ userId: String(user._id) }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
    setSessionCookie(res, token);
    logger.info('login_success', { userId: String(user._id) });
    return res.json({ role: user.role, username: user.username });
  } catch (err) { logger.error('login_error'); return res.status(500).json({ message: 'Erreur serveur' }); }
};
exports.register = async (req, res) => {
  const { username, email: rawEmail, password } = req.body || {};
  if (!text(username, 3, 30) || !email(rawEmail) || typeof password !== 'string' || password.length < 8 || password.length > 128)
    return res.status(400).json({ message: 'Nom (3-30 caractères), email valide et mot de passe (8-128 caractères) requis' });
  try {
    await User.create({ username: username.trim(), email: rawEmail.trim().toLowerCase(), password, role: 'user' });
    logger.info('account_registered');
    return res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Compte déjà existant' });
    logger.error('registration_error');
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
exports.me = (req, res) => res.json({ username: req.user.username, role: req.user.role });
exports.logout = (req, res) => { setSessionCookie(res, '', 0); res.json({ message: 'Déconnecté' }); };
