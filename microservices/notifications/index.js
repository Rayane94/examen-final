const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'notifications' }));
const mode = process.env.MAIL_MODE || 'disabled';
const transporter = mode === 'smtp' ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
}) : null;
app.post('/notify', async (req, res) => {
  const { to, subject, text } = req.body || {};
  if (typeof subject !== 'string' || !subject || subject.length > 150 || typeof text !== 'string' || text.length > 5000)
    return res.status(400).json({ message: 'Notification invalide' });
  if (!transporter) { console.log(JSON.stringify({ event:'notification_skipped', reason:'SMTP non configuré' })); return res.status(202).json({ status:'skipped', message:'SMTP non configuré' }); }
  if (typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return res.status(400).json({ message: 'Destinataire invalide' });
  try {
    await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
    console.log(JSON.stringify({ event:'notification_sent' }));
    res.json({ status:'sent' });
  } catch (err) { console.error(JSON.stringify({ event:'notification_failed' })); res.status(502).json({ message:'Envoi impossible' }); }
});
app.listen(Number(process.env.NOTIFI_PORT || 4002), '0.0.0.0', () => console.log(JSON.stringify({ event:'notifications_started' })));
